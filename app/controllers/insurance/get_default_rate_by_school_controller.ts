import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getDefaultRateBySchoolValidator } from '#validators/insurance'

export default class GetDefaultRateBySchoolController {
  async handle({ request, response }: HttpContext) {
    const { limit = 10 } = await request.validateUsing(getDefaultRateBySchoolValidator)

    // Calculate default rate by school
    const schoolStats = await db.rawQuery(
      `
      SELECT
        s.id,
        s.name,
        s.has_insurance as "hasInsurance",
        COUNT(sp.id) as "totalPayments",
        COUNT(CASE WHEN sp.status = 'OVERDUE' THEN 1 END) as "overduePayments",
        CASE
          WHEN COUNT(sp.id) > 0
          THEN ROUND(COUNT(CASE WHEN sp.status = 'OVERDUE' THEN 1 END)::numeric / COUNT(sp.id)::numeric * 100, 2)
          ELSE 0
        END as "defaultRate"
      FROM schools s
      JOIN users u ON u.school_id = s.id
      JOIN students st ON st.user_id = u.id
      JOIN student_payments sp ON sp.student_id = st.id
      WHERE sp.type = 'TUITION'
      GROUP BY s.id, s.name, s.has_insurance
      HAVING COUNT(sp.id) > 0
      ORDER BY "defaultRate" DESC
      LIMIT ?
    `,
      [limit]
    )

    const schools = schoolStats.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      hasInsurance: row.hasInsurance,
      totalPayments: Number(row.totalPayments),
      overduePayments: Number(row.overduePayments),
      defaultRate: Number(row.defaultRate),
    }))

    // Calculate platform-wide default rate
    const platformStats = await db.rawQuery(`
      SELECT
        COUNT(*) as "totalPayments",
        COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) as "overduePayments"
      FROM student_payments
      WHERE type = 'TUITION'
    `)

    const totalPayments = Number(platformStats.rows[0]?.totalPayments || 0)
    const overduePayments = Number(platformStats.rows[0]?.overduePayments || 0)
    const platformDefaultRate =
      totalPayments > 0 ? Math.round((overduePayments / totalPayments) * 10000) / 100 : 0

    return response.ok({
      platformDefaultRate,
      schools,
    })
  }
}
