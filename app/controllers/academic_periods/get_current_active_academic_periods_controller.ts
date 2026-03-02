import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'

export default class GetCurrentActiveAcademicPeriodsController {
  async handle({ auth, response, serialize }: HttpContext) {
    const schoolId = auth.user?.schoolId

    if (!schoolId) {
      return response.ok([])
    }

    const periods = await AcademicPeriod.query()
      .where('schoolId', schoolId)
      .where('isActive', true)
      .whereNull('deletedAt')
      .orderBy('startDate', 'desc')

    return response.ok(serialize(AcademicPeriodTransformer.transform(periods)))
  }
}
