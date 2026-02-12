import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import ExtraClass from '#models/extra_class'
import ExtraClassSchedule from '#models/extra_class_schedule'
import ExtraClassAttendance from '#models/extra_class_attendance'
import StudentHasExtraClassAttendance from '#models/student_has_extra_class_attendance'
import { createExtraClassAttendanceValidator } from '#validators/extra_class'
import AppException from '#exceptions/app_exception'

export default class CreateExtraClassAttendanceController {
  async handle({ params, request, response }: HttpContext) {
    const data = await request.validateUsing(createExtraClassAttendanceValidator)

    const extraClass = await ExtraClass.find(params.id)
    if (!extraClass) {
      throw AppException.notFound('Aula avulsa não encontrada')
    }

    const attendanceDate = DateTime.fromJSDate(data.date)
    const weekDay = attendanceDate.weekday % 7 // Luxon: 1=Mon...7=Sun -> 0=Sun, 1=Mon...6=Sat

    const schedule = await ExtraClassSchedule.query()
      .where('extraClassId', extraClass.id)
      .where('weekDay', weekDay)
      .first()

    if (!schedule) {
      throw AppException.badRequest(
        'Não há horário cadastrado para esta aula avulsa neste dia da semana'
      )
    }

    const trx = await db.transaction()

    try {
      const attendance = await ExtraClassAttendance.create(
        {
          extraClassId: extraClass.id,
          extraClassScheduleId: schedule.id,
          date: attendanceDate,
        },
        { client: trx }
      )

      for (const item of data.attendances) {
        await StudentHasExtraClassAttendance.create(
          {
            studentId: item.studentId,
            extraClassAttendanceId: attendance.id,
            status: item.status,
            justification: item.justification ?? null,
          },
          { client: trx }
        )
      }

      await trx.commit()

      await attendance.load('studentAttendances', (q) => {
        q.preload('student', (sq) => sq.preload('user'))
      })

      return response.created(attendance)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
