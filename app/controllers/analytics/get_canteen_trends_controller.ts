import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getCanteenTrendsValidator } from '#validators/analytics'

interface TrendRow {
  period: string
  total_sales: string
  revenue: string
}

export default class GetCanteenTrendsController {
  async handle({ request, response }: HttpContext) {
    const {
      schoolId,
      schoolChainId,
      period = 'month',
    } = await request.validateUsing(getCanteenTrendsValidator)

    let schoolFilter = ''
    const params: Record<string, string> = {}

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    } else if (schoolChainId) {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }

    let dateFormat: string
    let dateInterval: string

    switch (period) {
      case 'week':
        dateFormat = 'YYYY-MM-DD'
        dateInterval = '7 days'
        break
      case 'year':
        dateFormat = 'YYYY-MM'
        dateInterval = '12 months'
        break
      default:
        dateFormat = 'YYYY-MM-DD'
        dateInterval = '30 days'
    }

    const trendsResult = await db.rawQuery(
      `
      SELECT
        TO_CHAR(cp."createdAt", '${dateFormat}') as period,
        COUNT(*) as total_sales,
        COALESCE(SUM(cp."totalAmount"), 0) as revenue
      FROM "CanteenPurchase" cp
      JOIN "Canteen" c ON cp."canteenId" = c.id
      JOIN "School" s ON c."schoolId" = s.id
      WHERE cp."createdAt" >= NOW() - INTERVAL '${dateInterval}'
      ${schoolFilter}
      GROUP BY TO_CHAR(cp."createdAt", '${dateFormat}')
      ORDER BY period ASC
      `,
      params
    )

    const trends = (trendsResult.rows as TrendRow[]).map((row) => ({
      period: row.period,
      totalSales: Number(row.total_sales),
      revenue: Math.round(Number(row.revenue) * 100) / 100,
    }))

    return response.ok({ trends })
  }
}
