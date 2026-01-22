import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import { listAcademicPeriodsValidator } from '#validators/academic_period'

export default class ListAcademicPeriodsController {
  async handle(ctx: HttpContext) {
    const { request, response, auth } = ctx
    const payload = await request.validateUsing(listAcademicPeriodsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const effectiveUser = ctx.effectiveUser || auth.user
    const schoolId = payload.schoolId ?? effectiveUser?.schoolId

    const query = AcademicPeriod.query().orderBy('startDate', 'desc')

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    const periods = await query.paginate(page, limit)

    return response.ok(periods)
  }
}
