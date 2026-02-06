import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'
import ExtraClass from '#models/extra_class'
import ExtraClassSchedule from '#models/extra_class_schedule'
import AcademicPeriod from '#models/academic_period'
import { createExtraClassValidator } from '#validators/extra_class'

export default class CreateExtraClassController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createExtraClassValidator)

    const academicPeriod = await AcademicPeriod.findOrFail(data.academicPeriodId)

    const trx = await db.transaction()

    try {
      const slug = string.slug(data.name, { lower: true })

      const extraClass = await ExtraClass.create(
        {
          name: data.name,
          slug,
          description: data.description ?? null,
          schoolId: academicPeriod.schoolId,
          academicPeriodId: data.academicPeriodId,
          contractId: data.contractId,
          teacherId: data.teacherId,
          maxStudents: data.maxStudents ?? null,
          isActive: true,
        },
        { client: trx }
      )

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

      await trx.commit()

      await extraClass.load('schedules')
      await extraClass.load('teacher', (q) => q.preload('user'))
      await extraClass.load('contract')
      await extraClass.load('academicPeriod')

      return response.created(extraClass)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
