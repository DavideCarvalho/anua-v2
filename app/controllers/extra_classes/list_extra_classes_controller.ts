import type { HttpContext } from '@adonisjs/core/http'
import ExtraClass from '#models/extra_class'
import ExtraClassDto from '#models/dto/extra_class.dto'
import { listExtraClassesValidator } from '#validators/extra_class'

export default class ListExtraClassesController {
  async handle({ request }: HttpContext) {
    const data = await request.validateUsing(listExtraClassesValidator)

    const page = data.page ?? 1
    const limit = data.limit ?? 20

    const query = ExtraClass.query()
      .preload('schedules')
      .preload('teacher', (q) => q.preload('user'))
      .preload('contract')
      .preload('academicPeriod')
      .withCount('enrollments', (q) => q.whereNull('cancelledAt'))
      .orderBy('name', 'asc')

    if (data.schoolId) {
      query.where('schoolId', data.schoolId)
    }

    if (data.academicPeriodId) {
      query.where('academicPeriodId', data.academicPeriodId)
    }

    if (data.isActive !== undefined) {
      query.where('isActive', data.isActive)
    }

    if (data.search) {
      query.where('name', 'ilike', `%${data.search}%`)
    }

    const extraClasses = await query.paginate(page, limit)

    return ExtraClassDto.fromPaginator(extraClasses)
  }
}
