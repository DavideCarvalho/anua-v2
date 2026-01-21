import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getCanteenOverviewValidator } from '#validators/analytics'

export default class GetCanteenOverviewController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, schoolChainId } = await request.validateUsing(getCanteenOverviewValidator)

    let schoolFilter = ''
    const params: Record<string, string> = {}

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    } else if (schoolChainId) {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }

    const [salesStatsResult, todaySalesResult, itemsStatsResult, transactionsResult] =
      await Promise.all([
        // Total de vendas (all time)
        db.rawQuery(
          `
        SELECT
          COUNT(*) as total_sales,
          COALESCE(SUM(cp."totalAmount"), 0) as total_revenue
        FROM "CanteenPurchase" cp
        JOIN "Canteen" c ON cp."canteenId" = c.id
        JOIN "School" s ON c."schoolId" = s.id
        WHERE 1=1 ${schoolFilter}
        `,
          params
        ),

        // Vendas de hoje
        db.rawQuery(
          `
        SELECT
          COUNT(*) as today_sales,
          COALESCE(SUM(cp."totalAmount"), 0) as today_revenue
        FROM "CanteenPurchase" cp
        JOIN "Canteen" c ON cp."canteenId" = c.id
        JOIN "School" s ON c."schoolId" = s.id
        WHERE DATE(cp."createdAt") = CURRENT_DATE
        ${schoolFilter}
        `,
          params
        ),

        // Stats de itens
        db.rawQuery(
          `
        SELECT
          COUNT(DISTINCT ci.id) as total_items,
          COUNT(DISTINCT CASE WHEN ci."isActive" = true THEN ci.id END) as available_items
        FROM "CanteenItem" ci
        JOIN "Canteen" c ON ci."canteenId" = c.id
        JOIN "School" s ON c."schoolId" = s.id
        WHERE 1=1 ${schoolFilter}
        `,
          params
        ),

        // Transacoes de saldo
        db.rawQuery(
          `
        SELECT
          COUNT(*) as total_transactions,
          COALESCE(SUM(CASE WHEN sbt.type IN ('TOP_UP', 'REFUND') THEN sbt.amount ELSE 0 END), 0) as total_credits,
          COALESCE(SUM(CASE WHEN sbt.type IN ('CANTEEN_PURCHASE', 'STORE_PURCHASE') THEN sbt.amount ELSE 0 END), 0) as total_debits
        FROM "StudentBalanceTransaction" sbt
        JOIN "Student" st ON sbt."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE 1=1 ${schoolFilter}
        `,
          params
        ),
      ])

    const totalSales = Number(salesStatsResult.rows[0]?.total_sales || 0)
    const totalRevenue = Number(salesStatsResult.rows[0]?.total_revenue || 0)
    const todaySales = Number(todaySalesResult.rows[0]?.today_sales || 0)
    const todayRevenue = Number(todaySalesResult.rows[0]?.today_revenue || 0)
    const totalItems = Number(itemsStatsResult.rows[0]?.total_items || 0)
    const availableItems = Number(itemsStatsResult.rows[0]?.available_items || 0)
    const totalCredits = Number(transactionsResult.rows[0]?.total_credits || 0)
    const totalDebits = Number(transactionsResult.rows[0]?.total_debits || 0)

    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

    return response.ok({
      totalSales,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      todaySales,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      averageTicket: Math.round(averageTicket * 100) / 100,
      totalItems,
      availableItems,
      totalCredits: Math.round(totalCredits * 100) / 100,
      totalDebits: Math.round(totalDebits * 100) / 100,
    })
  }
}
