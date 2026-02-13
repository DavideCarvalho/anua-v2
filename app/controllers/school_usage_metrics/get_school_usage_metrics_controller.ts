import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import SchoolUsageMetrics from '#models/school_usage_metrics'
import { getSchoolUsageMetricsValidator } from '#validators/subscription'
import AppException from '#exceptions/app_exception'

export default class GetSchoolUsageMetricsController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(getSchoolUsageMetricsValidator)

    const { schoolId, month, year } = payload

    const now = DateTime.now()
    const targetMonth = month ?? now.month
    const targetYear = year ?? now.year

    const metrics = await SchoolUsageMetrics.query()
      .where('schoolId', schoolId)
      .where('month', targetMonth)
      .where('year', targetYear)
      .preload('school')
      .first()

    if (!metrics) {
      throw AppException.notFound(
        'Métricas de uso da escola não encontradas para o período informado'
      )
    }

    return metrics
  }
}
