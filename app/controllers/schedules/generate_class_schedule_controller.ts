import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import TeacherHasClass from '#models/teacher_has_class'
import TeacherAvailability from '#models/teacher_availability'
import AppException from '#exceptions/app_exception'
import { generateClassScheduleValidator } from '#validators/schedules'

interface ScheduleConfig {
  startTime: string // "07:30"
  classesPerDay: number // 6
  classDuration: number // 50 minutes
  breakAfterClass: number // 3 (break after 3rd class)
  breakDuration: number // 20 minutes
}

interface TimeSlot {
  startTime: string
  endTime: string
  isBreak: boolean
  teacherHasClassId: string | null
}

interface GeneratedSlot {
  classWeekDay: number
  startTime: string
  endTime: string
  minutes: number
  isBreak: boolean
  teacherHasClassId: string | null
  teacherHasClass: {
    id: string
    teacher: { id: string; user: { name: string } }
    subject: { id: string; name: string }
  } | null
}

interface UnscheduledClass {
  id: string
  subjectQuantity: number
  remainingLessons: number
  teacher: { id: string; user: { name: string } }
  subject: { id: string; name: string }
}

const DAYS_OF_WEEK = [
  { name: 'MONDAY', number: 1 },
  { name: 'TUESDAY', number: 2 },
  { name: 'WEDNESDAY', number: 3 },
  { name: 'THURSDAY', number: 4 },
  { name: 'FRIDAY', number: 5 },
]

function toMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + mins
}

function addMinutesToTime(time: string, minutes: number): string {
  const totalMinutes = toMinutes(time) + minutes
  const newHours = Math.floor(totalMinutes / 60)
  const newMins = totalMinutes % 60
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`
}

function generateTimeSlotsForDay(config: ScheduleConfig): TimeSlot[] {
  const slots: TimeSlot[] = []
  let currentTime = config.startTime

  for (let i = 0; i < config.classesPerDay; i++) {
    const endTime = addMinutesToTime(currentTime, config.classDuration)

    slots.push({
      startTime: currentTime,
      endTime: endTime,
      isBreak: false,
      teacherHasClassId: null,
    })

    // Add break after specified class
    if (i + 1 === config.breakAfterClass && config.breakDuration > 0) {
      const breakEndTime = addMinutesToTime(endTime, config.breakDuration)
      slots.push({
        startTime: endTime,
        endTime: breakEndTime,
        isBreak: true,
        teacherHasClassId: null,
      })
      currentTime = breakEndTime
    } else {
      currentTime = endTime
    }
  }

  return slots
}

function isTeacherAvailableForSlot(
  availabilities: TeacherAvailability[],
  day: string,
  slotStart: string,
  slotEnd: string
): boolean {
  // If no availabilities defined, assume teacher is always available
  if (availabilities.length === 0) return true

  return availabilities.some((avail) => {
    if (avail.day.toUpperCase() !== day.toUpperCase()) return false
    // Teacher's availability must cover the entire slot
    return avail.startTime <= slotStart && avail.endTime >= slotEnd
  })
}

export default class GenerateClassScheduleController {
  async handle({ params, request, response }: HttpContext) {
    const classId = params.classId
    const {
      academicPeriodId,
      config: rawConfig,
      preserveAssignments = false,
    } = await request.validateUsing(generateClassScheduleValidator)

    // Normalize startTime to remove seconds if present
    const config = {
      ...rawConfig,
      startTime: rawConfig.startTime.split(':').slice(0, 2).join(':'),
    }

    // Get all teacher-class assignments for this class
    const teacherClasses = await TeacherHasClass.query()
      .where('classId', classId)
      .where('isActive', true)
      .preload('teacher', (query) => {
        query.preload('user')
      })
      .preload('subject')

    if (teacherClasses.length === 0) {
      // Check if there are any inactive records
      const inactiveCount = await TeacherHasClass.query()
        .where('classId', classId)
        .where('isActive', false)
        .count('* as total')

      const hasInactive = Number(inactiveCount[0].$extras.total) > 0

      if (hasInactive) {
        throw AppException.badRequest(
          'As atribuições de professor/matéria desta turma estão inativas. Edite a turma e salve novamente para reativá-las.'
        )
      }

      throw AppException.badRequest(
        'Nenhum professor/matéria atribuído a esta turma. Configure as atribuições primeiro.'
      )
    }

    // Get teacher availabilities
    const teacherIds = [...new Set(teacherClasses.map((tc) => tc.teacherId))]
    const availabilities = await TeacherAvailability.query().whereIn('teacherId', teacherIds)

    const availabilitiesByTeacher: Record<string, TeacherAvailability[]> = {}
    for (const avail of availabilities) {
      if (!availabilitiesByTeacher[avail.teacherId]) {
        availabilitiesByTeacher[avail.teacherId] = []
      }
      availabilitiesByTeacher[avail.teacherId].push(avail)
    }

    // Get occupied slots for teachers in other classes (same academic period)
    const occupiedSlots = await this.getOccupiedSlotsForTeachers(
      academicPeriodId,
      teacherIds,
      classId
    )

    // Get current calendar slots if preserving assignments
    let preservedAssignments: Map<string, { teacherHasClassId: string; day: number }> = new Map()
    if (preserveAssignments) {
      const currentCalendar = await Calendar.query()
        .where('classId', classId)
        .where('academicPeriodId', academicPeriodId)
        .where('isActive', true)
        .first()

      if (currentCalendar) {
        const currentSlots = await CalendarSlot.query()
          .where('calendarId', currentCalendar.id)
          .where('isBreak', false)
          .whereNotNull('teacherHasClassId')

        // For each current slot, find the best matching new slot
        for (const slot of currentSlots) {
          if (!slot.teacherHasClassId) continue

          const slotStart = slot.startTime.split(':').slice(0, 2).join(':')
          const slotEnd = slot.endTime.split(':').slice(0, 2).join(':')
          const slotStartMin = toMinutes(slotStart)
          const slotEndMin = toMinutes(slotEnd)
          const slotDuration = slotEndMin - slotStartMin

          let bestOverlap = 0
          let bestNewSlotKey: string | null = null

          // Generate all new slots to compare
          const newSlots = generateTimeSlotsForDay(config)
          for (const newSlot of newSlots) {
            if (newSlot.isBreak) continue

            const newStartMin = toMinutes(newSlot.startTime)
            const newEndMin = toMinutes(newSlot.endTime)

            // Calculate overlap
            const overlapStart = Math.max(slotStartMin, newStartMin)
            const overlapEnd = Math.min(slotEndMin, newEndMin)
            const overlapDuration = Math.max(0, overlapEnd - overlapStart)
            const overlapRatio = overlapDuration / slotDuration

            // Require at least 50% overlap
            if (overlapRatio >= 0.5 && overlapDuration > bestOverlap) {
              bestOverlap = overlapDuration
              bestNewSlotKey = `${slot.classWeekDay}_${newSlot.startTime}-${newSlot.endTime}`
            }
          }

          if (bestNewSlotKey) {
            // Check if this slot was already assigned
            if (!preservedAssignments.has(bestNewSlotKey)) {
              preservedAssignments.set(bestNewSlotKey, {
                teacherHasClassId: slot.teacherHasClassId,
                day: slot.classWeekDay,
              })
            }
          }
        }
      }
    }

    // Track remaining lessons per teacher-class
    const lessonsTracker = teacherClasses.map((tc) => ({
      id: tc.id,
      teacherId: tc.teacherId,
      subjectId: tc.subject.id,
      subjectQuantity: tc.subjectQuantity,
      remainingLessons: tc.subjectQuantity,
      teacher: {
        id: tc.teacher.id,
        user: { name: tc.teacher.user.name },
      },
      subject: {
        id: tc.subject.id,
        name: tc.subject.name,
      },
    }))

    // Sort by total lessons (most lessons first)
    lessonsTracker.sort((a, b) => b.subjectQuantity - a.subjectQuantity)

    // Generate schedule
    const generatedSlots: GeneratedSlot[] = []

    for (const day of DAYS_OF_WEEK) {
      const daySlots = generateTimeSlotsForDay(config)

      for (const slot of daySlots) {
        if (slot.isBreak) {
          generatedSlots.push({
            classWeekDay: day.number,
            startTime: slot.startTime,
            endTime: slot.endTime,
            minutes: config.breakDuration,
            isBreak: true,
            teacherHasClassId: null,
            teacherHasClass: null,
          })
          continue
        }

        const slotKey = `${day.number}_${slot.startTime}-${slot.endTime}`
        const preservedAssignment = preservedAssignments.get(slotKey)

        // Check if this slot has a preserved assignment
        if (preservedAssignment) {
          const teacherClass = teacherClasses.find(
            (tc) => tc.id === preservedAssignment.teacherHasClassId
          )
          if (teacherClass) {
            const tracker = lessonsTracker.find((t) => t.id === teacherClass.id)
            if (tracker && tracker.remainingLessons > 0) {
              generatedSlots.push({
                classWeekDay: day.number,
                startTime: slot.startTime,
                endTime: slot.endTime,
                minutes: config.classDuration,
                isBreak: false,
                teacherHasClassId: teacherClass.id,
                teacherHasClass: {
                  id: teacherClass.id,
                  teacher: {
                    id: teacherClass.teacher.id,
                    user: { name: teacherClass.teacher.user.name },
                  },
                  subject: {
                    id: teacherClass.subject.id,
                    name: teacherClass.subject.name,
                  },
                },
              })
              tracker.remainingLessons--
              continue
            }
          }
        }

        // Try to find a suitable teacher-class for this slot
        let assigned = false

        for (const tracker of lessonsTracker) {
          if (tracker.remainingLessons <= 0) continue

          // Check teacher availability
          const teacherAvailabilities = availabilitiesByTeacher[tracker.teacherId] || []
          if (
            !isTeacherAvailableForSlot(
              teacherAvailabilities,
              day.name,
              slot.startTime,
              slot.endTime
            )
          ) {
            continue
          }

          // Check if teacher is occupied in another class at this time
          const teacherOccupied = occupiedSlots[tracker.teacherId]?.[day.name]?.some(
            (occupied) =>
              (slot.startTime >= occupied.startTime && slot.startTime < occupied.endTime) ||
              (slot.endTime > occupied.startTime && slot.endTime <= occupied.endTime)
          )
          if (teacherOccupied) continue

          // Check if same subject already has 2 consecutive classes
          const lastTwoSlots = generatedSlots
            .filter((s) => s.classWeekDay === day.number && !s.isBreak)
            .slice(-2)
          const sameSubjectConsecutive = lastTwoSlots.filter(
            (s) => s.teacherHasClass?.subject.id === tracker.subjectId
          ).length
          if (sameSubjectConsecutive >= 2) continue

          // Assign this slot
          generatedSlots.push({
            classWeekDay: day.number,
            startTime: slot.startTime,
            endTime: slot.endTime,
            minutes: config.classDuration,
            isBreak: false,
            teacherHasClassId: tracker.id,
            teacherHasClass: {
              id: tracker.id,
              teacher: tracker.teacher,
              subject: tracker.subject,
            },
          })

          tracker.remainingLessons--
          assigned = true
          break
        }

        if (!assigned) {
          // Empty slot
          generatedSlots.push({
            classWeekDay: day.number,
            startTime: slot.startTime,
            endTime: slot.endTime,
            minutes: config.classDuration,
            isBreak: false,
            teacherHasClassId: null,
            teacherHasClass: null,
          })
        }
      }
    }

    // Collect unscheduled classes
    const unscheduled: UnscheduledClass[] = lessonsTracker
      .filter((t) => t.remainingLessons > 0)
      .map((t) => ({
        id: t.id,
        subjectQuantity: t.subjectQuantity,
        remainingLessons: t.remainingLessons,
        teacher: t.teacher,
        subject: t.subject,
      }))

    // Return generated slots without persisting
    // Frontend will handle persistence via save API
    return response.ok({
      slots: generatedSlots,
      unscheduled,
    })
  }

  private async getOccupiedSlotsForTeachers(
    academicPeriodId: string,
    teacherIds: string[],
    excludeClassId: string
  ): Promise<Record<string, Record<string, Array<{ startTime: string; endTime: string }>>>> {
    const occupied: Record<
      string,
      Record<string, Array<{ startTime: string; endTime: string }>>
    > = {}

    // Initialize structure
    for (const teacherId of teacherIds) {
      occupied[teacherId] = {
        MONDAY: [],
        TUESDAY: [],
        WEDNESDAY: [],
        THURSDAY: [],
        FRIDAY: [],
      }
    }

    if (teacherIds.length === 0) {
      return occupied
    }

    // Query occupied slots using raw query for proper table name casing
    const slotsResult = await db.rawQuery<{
      rows: Array<{
        teacherId: string
        classWeekDay: number
        startTime: string
        endTime: string
      }>
    }>(
      `
      SELECT
        thc."teacherId",
        cs."classWeekDay",
        cs."startTime",
        cs."endTime"
      FROM "CalendarSlot" cs
      INNER JOIN "Calendar" c ON cs."calendarId" = c."id"
      INNER JOIN "Class" cl ON c."classId" = cl."id"
      INNER JOIN "TeacherHasClass" thc ON cs."teacherHasClassId" = thc."id"
      WHERE c."academicPeriodId" = :academicPeriodId
        AND c."isActive" = true
        AND c."isCanceled" = false
        AND cl."isArchived" = false
        AND c."classId" != :excludeClassId
        AND thc."teacherId" = ANY(:teacherIds)
        AND cs."isBreak" = false
      `,
      { academicPeriodId, excludeClassId, teacherIds }
    )

    const slots = slotsResult.rows

    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

    for (const slot of slots) {
      const teacherId = slot.teacherId
      const dayName = dayNames[slot.classWeekDay]
      if (dayName && occupied[teacherId]?.[dayName]) {
        occupied[teacherId][dayName].push({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })
      }
    }

    return occupied
  }
}
