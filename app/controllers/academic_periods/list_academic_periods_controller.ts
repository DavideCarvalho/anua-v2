import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import { listAcademicPeriodsValidator } from '#validators/academic_period'

export default class ListAcademicPeriodsController {
  async handle({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(listAcademicPeriodsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const schoolId = payload.schoolId ?? auth.user?.schoolId

    const query = AcademicPeriod.query().orderBy('startDate', 'desc')

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    const periods = await query.paginate(page, limit)

    return response.ok(periods)
  }
}
