import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'
import ExtraClass from '#models/extra_class'
import ExtraClassSchedule from '#models/extra_class_schedule'
import { updateExtraClassValidator } from '#validators/extra_class'
import AppException from '#exceptions/app_exception'

export default class UpdateExtraClassController {
  async handle({ params, request, response }: HttpContext) {
    const data = await request.validateUsing(updateExtraClassValidator)

    const extraClass = await ExtraClass.find(params.id)
    if (!extraClass) {
      throw AppException.notFound('Aula avulsa não encontrada')
    }

    const trx = await db.transaction()

    try {
      if (data.name) {
        extraClass.name = data.name
        extraClass.slug = string.slug(data.name, { lower: true })
      }
      if (data.description !== undefined) extraClass.description = data.description ?? null
      if (data.contractId) extraClass.contractId = data.contractId
      if (data.teacherId) extraClass.teacherId = data.teacherId
      if (data.maxStudents !== undefined) extraClass.maxStudents = data.maxStudents ?? null
      if (data.isActive !== undefined) extraClass.isActive = data.isActive

      extraClass.useTransaction(trx)
      await extraClass.save()

      if (data.schedules) {
        await ExtraClassSchedule.query({ client: trx })
          .where('extraClassId', extraClass.id)
          .delete()

        for (const schedule of data.schedules) {
          await ExtraClassSchedule.create(
            {
              extraClassId: extraClass.id,
              weekDay: schedule.weekDay,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            },
            { client: trx }
          )
        }
      }

      await trx.commit()

      await extraClass.load('schedules')
      await extraClass.load('teacher', (q) => q.preload('user'))
      await extraClass.load('contract')
      await extraClass.load('academicPeriod')

      return response.ok(extraClass)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
