import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import SchoolUsageMetrics from '#models/school_usage_metrics'
import { getSchoolUsageMetricsValidator } from '#validators/subscription'

export default class GetSchoolUsageMetricsController {
  async handle({ request, response }: HttpContext) {
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
      return response.notFound({ message: 'School usage metrics not found for the specified period' })
    }

    return metrics
  }
}
