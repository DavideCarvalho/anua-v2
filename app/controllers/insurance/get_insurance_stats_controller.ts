import type { HttpContext } from '@adonisjs/core/http'
import InsuranceClaim from '#models/insurance_claim'
import InsuranceBilling from '#models/insurance_billing'
import StudentPayment from '#models/student_payment'
import School from '#models/school'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class GetInsuranceStatsController {
  async handle({ response }: HttpContext) {
    const now = DateTime.now()
    const startOfMonth = now.startOf('month')
    const endOfMonth = now.endOf('month')

    // Total schools with insurance
    const schoolsWithInsurance = await School.query()
      .where('hasInsurance', true)
      .count('* as count')

    const totalSchoolsWithInsurance = Number(schoolsWithInsurance[0].$extras.count || 0)

    // Count insured students (students in contracts with insurance)
    const insuredStudents = await db
      .from('student_has_levels')
      .join('contracts', 'student_has_levels.contract_id', 'contracts.id')
      .where('contracts.has_insurance', true)
      .countDistinct('student_has_levels.student_id as count')

    const totalInsuredStudents = Number(insuredStudents[0]?.count || 0)

    // Claims statistics
    const pendingClaims = await InsuranceClaim.query()
      .where('status', 'PENDING')
      .count('* as count')

    const totalPendingClaims = Number(pendingClaims[0].$extras.count || 0)

    const paidClaimsThisMonth = await InsuranceClaim.query()
      .where('status', 'PAID')
      .whereBetween('paidAt', [startOfMonth.toSQL()!, endOfMonth.toSQL()!])
      .count('* as count')

    const totalPaidClaimsThisMonth = Number(paidClaimsThisMonth[0].$extras.count || 0)

    const paidClaimsAmountThisMonth = await InsuranceClaim.query()
      .where('status', 'PAID')
      .whereBetween('paidAt', [startOfMonth.toSQL()!, endOfMonth.toSQL()!])
      .sum('covered_amount as total')

    const totalPaidAmountThisMonth = Number(paidClaimsAmountThisMonth[0].$extras.total || 0)

    // Billing statistics
    const pendingBillings = await InsuranceBilling.query()
      .where('status', 'PENDING')
      .count('* as count')

    const totalPendingBillings = Number(pendingBillings[0].$extras.count || 0)

    const monthlyRevenue = await InsuranceBilling.query()
      .where('status', 'PAID')
      .whereBetween('paidAt', [startOfMonth.toSQL()!, endOfMonth.toSQL()!])
      .sum('total_amount as total')

    const totalMonthlyRevenue = Number(monthlyRevenue[0].$extras.total || 0)

    // Overdue payments (for potential claims)
    const overduePayments = await StudentPayment.query()
      .where('status', 'OVERDUE')
      .whereHas('student', (studentQuery) => {
        studentQuery.whereHas('levels', (levelQuery) => {
          levelQuery.whereHas('contract', (contractQuery) => {
            contractQuery.where('hasInsurance', true)
          })
        })
      })
      .count('* as count')

    const totalOverduePayments = Number(overduePayments[0].$extras.count || 0)

    return response.ok({
      totalSchoolsWithInsurance,
      totalInsuredStudents,
      claims: {
        pending: totalPendingClaims,
        paidThisMonth: totalPaidClaimsThisMonth,
        paidAmountThisMonth: totalPaidAmountThisMonth,
      },
      billings: {
        pending: totalPendingBillings,
        revenueThisMonth: totalMonthlyRevenue,
      },
      overduePaymentsWithInsurance: totalOverduePayments,
    })
  }
}
