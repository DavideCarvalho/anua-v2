import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import { listAcademicPeriodsValidator } from '#validators/academic_period'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'

export default class ListAcademicPeriodsController {
  async handle(ctx: HttpContext) {
    const { request, selectedSchoolIds, serialize } = ctx
    const payload = await request.validateUsing(listAcademicPeriodsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    // Usar schoolId do payload (para admins) ou selectedSchoolIds do middleware
    const schoolIds = payload.schoolId ? [payload.schoolId] : selectedSchoolIds

    const query = AcademicPeriod.query().whereNull('deletedAt').orderBy('startDate', 'desc')

    if (schoolIds && schoolIds.length > 0) {
      query.whereIn('schoolId', schoolIds)
    }

    const periods = await query.paginate(page, limit)

    const data = periods.all()
    const metadata = periods.getMeta()

    return serialize(AcademicPeriodTransformer.paginate(data, metadata))
  }
}
