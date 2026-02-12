import type { HttpContext } from '@adonisjs/core/http'
import { v7 as uuidv7 } from 'uuid'
import db from '@adonisjs/lucid/services/db'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import TeacherHasClass from '#models/teacher_has_class'
import TeacherAvailability from '#models/teacher_availability'
import AppException from '#exceptions/app_exception'

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

function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
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
    const { academicPeriodId, config } = request.only(['academicPeriodId', 'config']) as {
      academicPeriodId: string
      config: ScheduleConfig
    }

    if (!academicPeriodId || !config) {
      throw AppException.badRequest('academicPeriodId e config são obrigatórios')
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

    // Create or update calendar
    const calendarName = `Grade ${new Date().toLocaleDateString('pt-BR')}`

    // Deactivate old calendars
    await Calendar.query()
      .where('classId', classId)
      .where('academicPeriodId', academicPeriodId)
      .update({ isActive: false })

    // Create new calendar
    const calendar = await Calendar.create({
      id: uuidv7(),
      classId,
      academicPeriodId,
      name: calendarName,
      isActive: true,
      isCanceled: false,
      isApproved: false,
    })

    // Create slots
    for (const slot of generatedSlots) {
      await CalendarSlot.create({
        id: uuidv7(),
        calendarId: calendar.id,
        teacherHasClassId: slot.teacherHasClassId,
        classWeekDay: slot.classWeekDay,
        startTime: slot.startTime,
        endTime: slot.endTime,
        minutes: slot.minutes,
        isBreak: slot.isBreak,
      })
    }

    return response.ok({
      calendar: {
        id: calendar.id,
        name: calendar.name,
        isActive: calendar.isActive,
      },
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
      INNER JOIN "TeacherHasClass" thc ON cs."teacherHasClassId" = thc."id"
      WHERE c."academicPeriodId" = :academicPeriodId
        AND c."isActive" = true
        AND c."isCanceled" = false
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
