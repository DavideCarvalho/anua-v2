import type { HttpContext } from '@adonisjs/core/http'
import TeacherHasClass from '#models/teacher_has_class'
import TeacherAvailability from '#models/teacher_availability'
import db from '@adonisjs/lucid/services/db'

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

export default class ValidateTeacherScheduleConflictController {
  async handle({ request, response }: HttpContext) {
    const { teacherHasClassId, classWeekDay, startTime, endTime, academicPeriodId, classId } =
      request.only([
        'teacherHasClassId',
        'classWeekDay',
        'startTime',
        'endTime',
        'academicPeriodId',
        'classId',
      ])

    if (!teacherHasClassId || !classWeekDay || !startTime || !endTime || !academicPeriodId) {
      return response.badRequest({
        error:
          'teacherHasClassId, classWeekDay, startTime, endTime, and academicPeriodId are required',
      })
    }

    // Get teacher from teacherHasClass
    const teacherHasClass = await TeacherHasClass.query()
      .where('id', teacherHasClassId)
      .preload('teacher', (query) => {
        query.preload('user')
      })
      .first()

    if (!teacherHasClass) {
      return response.badRequest({ error: 'TeacherHasClass not found' })
    }

    const teacherId = teacherHasClass.teacherId
    const dayName = DAYS_OF_WEEK[classWeekDay]

    // Check teacher availability
    const availabilities = await TeacherAvailability.query().where('teacherId', teacherId)
    const isAvailable = this.isTeacherAvailableForSlot(availabilities, dayName, startTime, endTime)

    if (!isAvailable) {
      return response.ok({
        hasConflict: true,
        reason: 'O professor não está disponível neste horário',
        teacherName: teacherHasClass.teacher.user?.name || 'Professor',
      })
    }

    // Check if teacher is occupied in another class at this time
    const isOccupied = await this.isTeacherOccupiedInOtherClass(
      teacherId,
      startTime,
      endTime,
      academicPeriodId,
      classId || ''
    )

    if (isOccupied) {
      return response.ok({
        hasConflict: true,
        reason: 'O professor já está ocupado em outra turma neste horário',
        teacherName: teacherHasClass.teacher.user?.name || 'Professor',
      })
    }

    return response.ok({
      hasConflict: false,
    })
  }

  private isTeacherAvailableForSlot(
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

  private async isTeacherOccupiedInOtherClass(
    teacherId: string,
    startTime: string,
    endTime: string,
    academicPeriodId: string,
    excludeClassId: string
  ): Promise<boolean> {
    const result = await db.rawQuery<{
      rows: Array<{
        classWeekDay: number
        startTime: string
        endTime: string
      }>
    }>(
      `
      SELECT cs."classWeekDay", cs."startTime", cs."endTime"
      FROM "CalendarSlot" cs
      JOIN "Calendar" c ON cs."calendarId" = c.id
      JOIN "TeacherHasClass" thc ON cs."teacherHasClassId" = thc.id
      WHERE c."academicPeriodId" = :academicPeriodId
        AND c."isActive" = true
        AND c."isCanceled" = false
        AND thc."teacherId" = :teacherId
        AND cs."isBreak" = false
        AND (
          (cs."startTime" >= :startTime AND cs."startTime" < :endTime) OR
          (cs."endTime" > :startTime AND cs."endTime" <= :endTime) OR
          (cs."startTime" <= :startTime AND cs."endTime" >= :endTime)
        )
    `,
      { academicPeriodId, teacherId, startTime, endTime }
    )

    // Se não há excludeClassId, verificar todos os conflitos
    if (!excludeClassId) {
      return result.rows.length > 0
    }

    // Se há excludeClassId, verificar apenas conflitos de outras turmas
    const conflictingSlots = await db.rawQuery<{
      rows: Array<{
        classId: string
      }>
    }>(
      `
      SELECT c."classId"
      FROM "CalendarSlot" cs
      JOIN "Calendar" c ON cs."calendarId" = c.id
      JOIN "TeacherHasClass" thc ON cs."teacherHasClassId" = thc.id
      WHERE c."academicPeriodId" = :academicPeriodId
        AND c."isActive" = true
        AND c."isCanceled" = false
        AND c."classId" != :excludeClassId
        AND thc."teacherId" = :teacherId
        AND cs."isBreak" = false
        AND (
          (cs."startTime" >= :startTime AND cs."startTime" < :endTime) OR
          (cs."endTime" > :startTime AND cs."endTime" <= :endTime) OR
          (cs."startTime" <= :startTime AND cs."endTime" >= :endTime)
        )
    `,
      { academicPeriodId, teacherId, startTime, endTime, excludeClassId }
    )

    return conflictingSlots.rows.length > 0
  }
}
