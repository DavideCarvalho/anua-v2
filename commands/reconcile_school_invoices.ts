import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import StudentPayment from '#models/student_payment'
import BillingReconciliationService from '#services/payments/billing_reconciliation_service'

export default class ReconcileSchoolInvoices extends BaseCommand {
  static commandName = 'invoices:reconcile-school'
  static description = 'Reconcile all invoices for a school'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({
    description: 'School ID to reconcile invoices for',
    required: true,
  })
  declare schoolId: string

  async run() {
    const students = await StudentPayment.query()
      .join('User', 'User.id', 'StudentPayment.studentId')
      .where('User.schoolId', this.schoolId)
      .select('StudentPayment.studentId')
      .distinct('StudentPayment.studentId')

    this.logger.info(`Found ${students.length} students with payments`)

    let reconciled = 0
    let errors = 0

    for (const { studentId } of students) {
      const payments = await StudentPayment.query()
        .where('studentId', studentId)
        .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        .whereNotIn('type', ['AGREEMENT'])

      for (const payment of payments) {
        try {
          await BillingReconciliationService.reconcileByPaymentId(payment.id, {
            keepUnpaidBeforePeriodClose: false,
          })
          reconciled++
        } catch (error) {
          errors++
          this.logger.error(
            `Error payment ${payment.id}: ${error instanceof Error ? error.message : String(error)}`
          )
        }
      }
    }

    this.logger.success(`Done. Reconciled: ${reconciled}, Errors: ${errors}`)
  }
}
