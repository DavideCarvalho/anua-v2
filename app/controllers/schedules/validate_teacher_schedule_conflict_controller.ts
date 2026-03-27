import type { HttpContext } from '@adonisjs/core/http'
import TeacherHasClass from '#models/teacher_has_class'
import TeacherAvailability from '#models/teacher_availability'
import db from '@adonisjs/lucid/services/db'
import AppException from '#exceptions/app_exception'
import { validateTeacherScheduleConflictValidator } from '#validators/schedules'
import ScheduleConflictValidationTransformer, {
  type ScheduleConflictValidation,
} from '#transformers/schedule_conflict_validation_transformer'

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

export default class ValidateTeacherScheduleConflictController {
  async handle({ request, serialize }: HttpContext): Promise<ScheduleConflictValidation> {
    const payload = await request.validateUsing(validateTeacherScheduleConflictValidator)
    let { teacherHasClassId, classWeekDay, startTime, endTime, academicPeriodId, classId } = payload

    // Normalize time strings to ensure they have seconds
    startTime = startTime.includes(':')
      ? startTime.split(':').slice(0, 2).join(':') + ':00'
      : startTime
    endTime = endTime.includes(':') ? endTime.split(':').slice(0, 2).join(':') + ':00' : endTime

    if (!teacherHasClassId || !classWeekDay || !startTime || !endTime || !academicPeriodId) {
      throw AppException.badRequest(
        'teacherHasClassId, classWeekDay, startTime, endTime e academicPeriodId são obrigatórios'
      )
    }

    // Get teacher from teacherHasClass
    const teacherHasClass = await TeacherHasClass.query()
      .where('id', teacherHasClassId)
      .preload('teacher', (query) => {
        query.preload('user')
      })
      .first()

    if (!teacherHasClass) {
      throw AppException.notFound('Vínculo professor-turma não encontrado')
    }

    const teacherId = teacherHasClass.teacherId
    const dayName = DAYS_OF_WEEK[classWeekDay]

    // Check teacher availability
    const availabilities = await TeacherAvailability.query().where('teacherId', teacherId)
    const isAvailable = this.isTeacherAvailableForSlot(availabilities, dayName, startTime, endTime)

    if (!isAvailable) {
      return serialize(
        ScheduleConflictValidationTransformer.transform({
          hasConflict: true,
          reason: 'O professor não está disponível neste horário',
          teacherName: teacherHasClass.teacher.user?.name || 'Professor',
        })
      )
    }

    // Check if teacher is occupied in another class at this time
    const conflictResult = await this.isTeacherOccupiedInOtherClass(
      teacherId,
      startTime,
      endTime,
      academicPeriodId,
      classId || ''
    )

    if (conflictResult.occupied) {
      const { className, levelName } = conflictResult
      const classLabel = className ? (levelName ? `${levelName} - ${className}` : className) : null
      const reason = classLabel
        ? `O professor já está ocupado na turma ${classLabel} neste horário`
        : 'O professor já está ocupado em outra turma neste horário'

      return serialize(
        ScheduleConflictValidationTransformer.transform({
          hasConflict: true,
          reason,
          teacherName: teacherHasClass.teacher.user?.name || 'Professor',
        })
      )
    }

    return serialize(ScheduleConflictValidationTransformer.transform({ hasConflict: false }))
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
  ): Promise<{ occupied: boolean; className?: string; levelName?: string }> {
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
      JOIN "Class" cl ON c."classId" = cl.id
      JOIN "TeacherHasClass" thc ON cs."teacherHasClassId" = thc.id
      WHERE c."academicPeriodId" = :academicPeriodId
        AND c."isActive" = true
        AND c."isCanceled" = false
        AND cl."isArchived" = false
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

    // Se não há excludeClassId, verificar todos os conflitos (sem nome da turma, fallback para mensagem genérica)
    if (!excludeClassId) {
      return { occupied: result.rows.length > 0 }
    }

    // Se há excludeClassId, verificar apenas conflitos de outras turmas e retornar o nome da turma e o ano/level
    const conflictingSlots = await db.rawQuery<{
      rows: Array<{
        classId: string
        className: string
        levelName: string | null
      }>
    }>(
      `
      SELECT c."classId", cl."name" AS "className", lv."name" AS "levelName"
      FROM "CalendarSlot" cs
      JOIN "Calendar" c ON cs."calendarId" = c.id
      JOIN "Class" cl ON c."classId" = cl.id
      LEFT JOIN "Level" lv ON cl."levelId" = lv.id
      JOIN "TeacherHasClass" thc ON cs."teacherHasClassId" = thc.id
      WHERE c."academicPeriodId" = :academicPeriodId
        AND c."isActive" = true
        AND c."isCanceled" = false
        AND cl."isArchived" = false
        AND c."classId" != :excludeClassId
        AND thc."teacherId" = :teacherId
        AND cs."isBreak" = false
        AND (
          (cs."startTime" >= :startTime AND cs."startTime" < :endTime) OR
          (cs."endTime" > :startTime AND cs."endTime" <= :endTime) OR
          (cs."startTime" <= :startTime AND cs."endTime" >= :endTime)
        )
      LIMIT 1
    `,
      { academicPeriodId, teacherId, startTime, endTime, excludeClassId }
    )

    return {
      occupied: conflictingSlots.rows.length > 0,
      className: conflictingSlots.rows[0]?.className,
      levelName: conflictingSlots.rows[0]?.levelName ?? undefined,
    }
  }
}
