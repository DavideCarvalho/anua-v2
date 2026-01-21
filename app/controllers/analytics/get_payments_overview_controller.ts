import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getPaymentsOverviewValidator } from '#validators/analytics'

export default class GetPaymentsOverviewController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, schoolChainId } = await request.validateUsing(getPaymentsOverviewValidator)

    let schoolFilter = ''
    const params: Record<string, string> = {}

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    } else if (schoolChainId) {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }

    const [paymentsStatsResult, overdueResult, thisMonthResult] = await Promise.all([
      // Stats gerais de pagamentos
      db.rawQuery(
        `
        SELECT
          COUNT(*) as total_payments,
          COUNT(CASE WHEN sp.status = 'PAID' THEN 1 END) as paid_count,
          COUNT(CASE WHEN sp.status = 'PENDING' THEN 1 END) as pending_count,
          COUNT(CASE WHEN sp.status = 'OVERDUE' THEN 1 END) as overdue_count,
          COALESCE(SUM(sp.amount), 0) as total_amount,
          COALESCE(SUM(CASE WHEN sp.status = 'PAID' THEN sp.amount ELSE 0 END), 0) as paid_amount,
          COALESCE(SUM(CASE WHEN sp.status = 'PENDING' THEN sp.amount ELSE 0 END), 0) as pending_amount,
          COALESCE(SUM(CASE WHEN sp.status = 'OVERDUE' THEN sp.amount ELSE 0 END), 0) as overdue_amount
        FROM "StudentPayment" sp
        JOIN "Student" st ON sp."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE 1=1 ${schoolFilter}
        `,
        params
      ),

      // Inadimplencia (pagamentos vencidos)
      db.rawQuery(
        `
        SELECT
          COUNT(DISTINCT st.id) as students_with_overdue,
          COUNT(*) as overdue_payments,
          COALESCE(SUM(sp.amount), 0) as overdue_total
        FROM "StudentPayment" sp
        JOIN "Student" st ON sp."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE sp.status = 'OVERDUE'
        OR (sp.status = 'PENDING' AND sp."dueDate" < CURRENT_DATE)
        ${schoolFilter}
        `,
        params
      ),

      // Pagamentos deste mes
      db.rawQuery(
        `
        SELECT
          COUNT(*) as month_payments,
          COALESCE(SUM(CASE WHEN sp.status = 'PAID' THEN sp.amount ELSE 0 END), 0) as month_received
        FROM "StudentPayment" sp
        JOIN "Student" st ON sp."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE DATE_TRUNC('month', sp."dueDate") = DATE_TRUNC('month', CURRENT_DATE)
        ${schoolFilter}
        `,
        params
      ),
    ])

    const totalPayments = Number(paymentsStatsResult.rows[0]?.total_payments || 0)
    const paidCount = Number(paymentsStatsResult.rows[0]?.paid_count || 0)
    const pendingCount = Number(paymentsStatsResult.rows[0]?.pending_count || 0)
    const overdueCount = Number(paymentsStatsResult.rows[0]?.overdue_count || 0)
    const totalAmount = Number(paymentsStatsResult.rows[0]?.total_amount || 0)
    const paidAmount = Number(paymentsStatsResult.rows[0]?.paid_amount || 0)
    const pendingAmount = Number(paymentsStatsResult.rows[0]?.pending_amount || 0)
    const overdueAmount = Number(paymentsStatsResult.rows[0]?.overdue_amount || 0)

    const studentsWithOverdue = Number(overdueResult.rows[0]?.students_with_overdue || 0)
    const overdueTotal = Number(overdueResult.rows[0]?.overdue_total || 0)

    const monthPayments = Number(thisMonthResult.rows[0]?.month_payments || 0)
    const monthReceived = Number(thisMonthResult.rows[0]?.month_received || 0)

    const paymentRate = totalPayments > 0 ? (paidCount / totalPayments) * 100 : 0
    const overdueRate = totalPayments > 0 ? (overdueCount / totalPayments) * 100 : 0

    return response.ok({
      totalPayments,
      paidCount,
      pendingCount,
      overdueCount,
      totalAmount: Math.round(totalAmount * 100) / 100,
      paidAmount: Math.round(paidAmount * 100) / 100,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      paymentRate: Math.round(paymentRate * 10) / 10,
      overdueRate: Math.round(overdueRate * 10) / 10,
      studentsWithOverdue,
      overdueTotal: Math.round(overdueTotal * 100) / 100,
      monthPayments,
      monthReceived: Math.round(monthReceived * 100) / 100,
    })
  }
}
