import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class ReconcileStudentInvoicesCommand extends BaseCommand {
  static commandName = 'invoices:reconcile-student'
  static description = 'Reconcile all invoices for a specific student'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({
    description: 'Student ID to reconcile invoices for',
    required: true,
  })
  declare studentId: string

  @flags.number({
    description: 'Month to reconcile (1-12). If not specified, reconciles all months with payments.',
  })
  declare month?: number

  @flags.number({
    description: 'Year to reconcile. If not specified, reconciles all years with payments.',
  })
  declare year?: number

  async run() {
    const { default: StudentPayment } = await import('#models/student_payment')
    const { default: GenerateInvoices } = await import('#start/jobs/generate_invoices')

    // Verify student exists
    const { default: Student } = await import('#models/student')
    const student = await Student.query()
      .where('id', this.studentId)
      .preload('user')
      .first()

    if (!student) {
      this.logger.error(`Student not found: ${this.studentId}`)
      this.exitCode = 1
      return
    }

    this.logger.info(`Reconciling invoices for student: ${student.user?.name ?? this.studentId}`)

    // Find all payments for this student that need reconciliation
    const query = StudentPayment.query()
      .where('studentId', this.studentId)
      .whereNotIn('type', ['AGREEMENT'])
      .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])

    if (this.month) {
      query.where('month', this.month)
    }
    if (this.year) {
      query.where('year', this.year)
    }

    const payments = await query.orderBy('year', 'asc').orderBy('month', 'asc')

    if (payments.length === 0) {
      this.logger.info('No payments found for reconciliation.')
      return
    }

    this.logger.info(`Found ${payments.length} payment(s) to reconcile`)

    let reconciled = 0
    let errors = 0

    for (const payment of payments) {
      try {
        await GenerateInvoices.reconcilePayment(payment)
        reconciled++
        this.logger.info(`  ✓ Payment ${payment.id} (${payment.month}/${payment.year} - ${payment.type})`)
      } catch (error) {
        errors++
        this.logger.error(`  ✗ Payment ${payment.id}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    this.logger.success(`Done. Reconciled: ${reconciled}, Errors: ${errors}`)
  }
}
