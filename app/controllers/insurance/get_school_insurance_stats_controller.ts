import type { HttpContext } from '@adonisjs/core/http'
import InsuranceClaim from '#models/insurance_claim'
import InsuranceBilling from '#models/insurance_billing'
import StudentPayment from '#models/student_payment'
import db from '@adonisjs/lucid/services/db'
import { getSchoolInsuranceStatsValidator } from '#validators/insurance'

export default class GetSchoolInsuranceStatsController {
  async handle({ request, response }: HttpContext) {
    const { schoolId } = await request.validateUsing(getSchoolInsuranceStatsValidator)

    // Count insured students for this school
    const insuredStudents = await db
      .from('student_has_levels')
      .join('contracts', 'student_has_levels.contract_id', 'contracts.id')
      .join('students', 'student_has_levels.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .where('contracts.has_insurance', true)
      .where('contracts.school_id', schoolId)
      .countDistinct('students.id as count')

    const totalInsuredStudents = Number(insuredStudents[0]?.count || 0)

    // Total students in school
    const totalStudents = await db
      .from('students')
      .join('users', 'students.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .count('* as count')

    const totalSchoolStudents = Number(totalStudents[0]?.count || 0)

    // Active claims for school
    const activeClaims = await InsuranceClaim.query()
      .whereIn('status', ['PENDING', 'APPROVED'])
      .whereHas('studentPayment', (paymentQuery) => {
        paymentQuery.whereHas('student', (studentQuery) => {
          studentQuery.whereHas('user', (userQuery) => {
            userQuery.where('schoolId', schoolId)
          })
        })
      })
      .count('* as count')

    const totalActiveClaims = Number(activeClaims[0].$extras.count || 0)

    // Latest billing
    const latestBilling = await InsuranceBilling.query()
      .where('schoolId', schoolId)
      .orderBy('period', 'desc')
      .first()

    // Calculate default rate for school
    const paymentStats = await StudentPayment.query()
      .where('type', 'TUITION')
      .whereHas('student', (studentQuery) => {
        studentQuery.whereHas('user', (userQuery) => {
          userQuery.where('schoolId', schoolId)
        })
      })
      .select(
        db.raw('COUNT(*) as total'),
        db.raw("COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) as overdue")
      )
      .first()

    const totalPayments = Number(paymentStats?.$extras.total || 0)
    const overduePayments = Number(paymentStats?.$extras.overdue || 0)
    const defaultRate =
      totalPayments > 0 ? Math.round((overduePayments / totalPayments) * 10000) / 100 : 0

    return response.ok({
      insuredStudents: totalInsuredStudents,
      totalStudents: totalSchoolStudents,
      insuredPercentage:
        totalSchoolStudents > 0
          ? Math.round((totalInsuredStudents / totalSchoolStudents) * 100)
          : 0,
      activeClaims: totalActiveClaims,
      defaultRate,
      latestBilling: latestBilling
        ? {
            id: latestBilling.id,
            period: latestBilling.period.toISODate(),
            totalAmount: latestBilling.totalAmount,
            status: latestBilling.status,
            dueDate: latestBilling.dueDate.toISODate(),
          }
        : null,
    })
  }
}
