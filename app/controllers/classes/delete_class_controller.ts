import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Class_ from '#models/class'
import ClassHasAcademicPeriod from '#models/class_has_academic_period'
import TeacherHasClass from '#models/teacher_has_class'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'

export default class DeleteClassController {
  async handle({ params, response }: HttpContext) {
    const class_ = await Class_.find(params.id)

    if (!class_) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    await db.transaction(async (trx) => {
      // Delete calendar slots for calendars of this class
      const calendars = await Calendar.query()
        .where('classId', params.id)
        .useTransaction(trx)

      for (const calendar of calendars) {
        await CalendarSlot.query()
          .where('calendarId', calendar.id)
          .useTransaction(trx)
          .delete()
      }

      // Delete calendars
      await Calendar.query()
        .where('classId', params.id)
        .useTransaction(trx)
        .delete()

      // Delete teacher-class assignments
      await TeacherHasClass.query()
        .where('classId', params.id)
        .useTransaction(trx)
        .delete()

      // Delete class-academic-period links
      await ClassHasAcademicPeriod.query()
        .where('classId', params.id)
        .useTransaction(trx)
        .delete()

      // Delete the class
      class_.useTransaction(trx)
      await class_.delete()
    })

    return response.noContent()
  }
}
