import type { HttpContext } from '@adonisjs/core/http'
import AcademicSubPeriod from '#models/academic_sub_period'
import { listAcademicSubPeriodsValidator } from '#validators/academic_sub_period'
import AcademicSubPeriodTransformer from '#transformers/academic_sub_period_transformer'

export default class ListAcademicSubPeriodsController {
  async handle(ctx: HttpContext) {
    const { request, selectedSchoolIds, serialize } = ctx
    const payload = await request.validateUsing(listAcademicSubPeriodsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const schoolIds = payload.schoolId ? [payload.schoolId] : selectedSchoolIds

    const query = AcademicSubPeriod.query().whereNull('deletedAt').orderBy('order', 'asc')

    if (schoolIds && schoolIds.length > 0) {
      query.whereIn('schoolId', schoolIds)
    }

    if (payload.academicPeriodId) {
      query.where('academicPeriodId', payload.academicPeriodId)
    }

    const subPeriods = await query.paginate(page, limit)

    const data = subPeriods.all()
    const metadata = subPeriods.getMeta()

    return serialize(AcademicSubPeriodTransformer.paginate(data, metadata))
  }
}
