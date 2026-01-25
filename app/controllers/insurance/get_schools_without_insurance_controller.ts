import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getSchoolsWithoutInsuranceValidator } from '#validators/insurance'

export default class GetSchoolsWithoutInsuranceController {
  async handle({ request, response }: HttpContext) {
    const { limit = 20 } = await request.validateUsing(getSchoolsWithoutInsuranceValidator)

    // Get schools without insurance with their default statistics
    const schools = await db.rawQuery(
      `
      SELECT
        s.id,
        s.name,
        COUNT(DISTINCT st.id) as "totalStudents",
        COUNT(sp.id) as "totalPayments",
        COUNT(CASE WHEN sp.status = 'OVERDUE' THEN 1 END) as "overduePayments",
        COALESCE(SUM(CASE WHEN sp.status = 'OVERDUE' THEN sp.amount END), 0) as "overdueAmount",
        CASE
          WHEN COUNT(sp.id) > 0
          THEN ROUND(COUNT(CASE WHEN sp.status = 'OVERDUE' THEN 1 END)::numeric / COUNT(sp.id)::numeric * 100, 2)
          ELSE 0
        END as "defaultRate"
      FROM schools s
      LEFT JOIN users u ON u.school_id = s.id
      LEFT JOIN students st ON st.user_id = u.id
      LEFT JOIN student_payments sp ON sp.student_id = st.id AND sp.type = 'TUITION'
      WHERE s.has_insurance IS NULL OR s.has_insurance = false
      GROUP BY s.id, s.name
      ORDER BY "overdueAmount" DESC
      LIMIT ?
    `,
      [limit]
    )

    const formattedSchools = schools.rows.map((row: any) => {
      const defaultRate = Number(row.defaultRate)
      const overdueAmount = Number(row.overdueAmount)
      const totalStudents = Number(row.totalStudents)

      // Calculate risk score (0-100)
      // Based on: default rate (40%), overdue amount (30%), student count (20%), trend (10% - not calculated here)
      const riskScore = Math.min(
        100,
        Math.round(
          defaultRate * 0.4 +
            Math.min(overdueAmount / 100000, 100) * 0.3 + // Normalize overdue amount
            Math.min(totalStudents / 100, 100) * 0.2 +
            10 // Base risk
        )
      )

      return {
        id: row.id,
        name: row.name,
        totalStudents,
        totalPayments: Number(row.totalPayments),
        overduePayments: Number(row.overduePayments),
        overdueAmount,
        defaultRate,
        riskScore,
        riskLevel: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW',
      }
    })

    return response.ok({
      data: formattedSchools,
      total: formattedSchools.length,
    })
  }
}
