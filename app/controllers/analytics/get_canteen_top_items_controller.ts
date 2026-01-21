import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getCanteenTopItemsValidator } from '#validators/analytics'

interface TopItemRow {
  id: string
  name: string
  price: string
  category: string | null
  total_sold: string
  quantity_sold: string
  total_revenue: string
}

export default class GetCanteenTopItemsController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, schoolChainId, limit = 10 } = await request.validateUsing(
      getCanteenTopItemsValidator
    )

    let schoolFilter = ''
    const params: Record<string, string | number> = { limit }

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    } else if (schoolChainId) {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }

    const topItemsResult = await db.rawQuery(
      `
      SELECT
        ci.id,
        ci.name,
        ci.price,
        ci.category,
        COUNT(cip.id) as total_sold,
        COALESCE(SUM(cip.quantity), 0) as quantity_sold,
        COALESCE(SUM(ci.price * cip.quantity), 0) as total_revenue
      FROM "CanteenItem" ci
      JOIN "Canteen" c ON ci."canteenId" = c.id
      JOIN "School" s ON c."schoolId" = s.id
      LEFT JOIN "CanteenItemPurchased" cip ON ci.id = cip."canteenItemId"
      WHERE 1=1 ${schoolFilter}
      GROUP BY ci.id, ci.name, ci.price, ci.category
      ORDER BY quantity_sold DESC
      LIMIT :limit
      `,
      params
    )

    const items = (topItemsResult.rows as TopItemRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price),
      category: row.category,
      totalSold: Number(row.total_sold),
      quantitySold: Number(row.quantity_sold),
      totalRevenue: Math.round(Number(row.total_revenue) * 100) / 100,
    }))

    return response.ok({ items })
  }
}
