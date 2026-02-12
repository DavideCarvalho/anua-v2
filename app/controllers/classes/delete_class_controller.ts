import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import TeacherHasClass from '#models/teacher_has_class'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import AppException from '#exceptions/app_exception'

export default class DeleteClassController {
  async handle({ params, response }: HttpContext) {
    const classEntity = await Class_.find(params.id)

    if (!classEntity) {
      throw AppException.notFound('Turma não encontrada')
    }

    await db.transaction(async (trx) => {
      // Delete calendar slots for calendars of this class
      const calendars = await Calendar.query().where('classId', params.id).useTransaction(trx)

      for (const calendar of calendars) {
        await CalendarSlot.query().where('calendarId', calendar.id).useTransaction(trx).delete()
      }

      // Delete calendars
      await Calendar.query().where('classId', params.id).useTransaction(trx).delete()

      // Delete teacher-class assignments
      await TeacherHasClass.query().where('classId', params.id).useTransaction(trx).delete()

      // Delete class-academic-period links
      await ClassHasAcademicPeriod.query().where('classId', params.id).useTransaction(trx).delete()

      // Delete the class
      classEntity.useTransaction(trx)
      await classEntity.delete()
    })

    return response.noContent()
  }
}
