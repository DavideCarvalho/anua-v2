import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class GenerateInvoicesCommand extends BaseCommand {
  static commandName = 'invoices:generate'
  static description =
    'Generate and reconcile invoices. Optionally filter by school IDs (comma-separated) and specify month/year.'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({
    description: 'School IDs (comma-separated) to generate invoices for (optional)',
    required: false,
  })
  declare schoolIds?: string

  @flags.number({
    description: 'Month to generate invoices for (1-12). Defaults to current month.',
  })
  declare month?: number

  @flags.number({ description: 'Year to generate invoices for. Defaults to current year.' })
  declare year?: number

  @flags.boolean({
    description: 'Generate invoices for all months that have eligible payments',
    alias: 'a',
  })
  declare allMonths?: boolean

  async run() {
    const { default: GenerateInvoices } = await import('#start/jobs/generate_invoices')

    const schoolIds = this.schoolIds
      ? this.schoolIds
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      : undefined

    this.logger.info(
      schoolIds
        ? `Running invoice generation for schools: ${schoolIds.join(', ')}...`
        : 'Running invoice generation for all schools...'
    )

    try {
      if (this.allMonths) {
        const { default: StudentPayment } = await import('#models/student_payment')

        const query = StudentPayment.query()
          .select('month', 'year')
          .whereNotIn('type', ['AGREEMENT'])
          .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
          .whereNull('invoiceId')
          .groupBy('month', 'year')
          .orderBy('year', 'asc')
          .orderBy('month', 'asc')

        if (schoolIds && schoolIds.length > 0) {
          query.whereHas('contract', (q) => {
            q.whereIn('schoolId', schoolIds)
          })
        }

        const monthYearPairs = await query

        if (monthYearPairs.length === 0) {
          this.logger.info('No unlinked payments found for any month.')
          return
        }

        this.logger.info(
          `Found payments in ${monthYearPairs.length} month(s): ${monthYearPairs.map((p) => `${p.month}/${p.year}`).join(', ')}`
        )

        let totalCreated = 0
        let totalReconciled = 0
        let totalLinked = 0
        let totalErrors = 0

        for (const pair of monthYearPairs) {
          this.logger.info(`Generating invoices for ${pair.month}/${pair.year}...`)
          const result = await GenerateInvoices.handle({
            schoolIds,
            month: pair.month,
            year: pair.year,
          })
          totalCreated += result.created
          totalReconciled += result.reconciled
          totalLinked += result.paymentsLinked
          totalErrors += result.errors
        }

        this.logger.success(
          `Done (all months). Created: ${totalCreated}, Reconciled: ${totalReconciled}, Payments linked: ${totalLinked}, Errors: ${totalErrors}`
        )
      } else {
        const result = await GenerateInvoices.handle({
          schoolIds,
          month: this.month,
          year: this.year,
        })
        this.logger.success(
          `Done. Created: ${result.created}, Reconciled: ${result.reconciled}, Payments linked: ${result.paymentsLinked}, Errors: ${result.errors}`
        )
      }
    } catch (error) {
      this.logger.error(`Failed: ${error instanceof Error ? error.message : String(error)}`)
      this.exitCode = 1
    }
  }
}
