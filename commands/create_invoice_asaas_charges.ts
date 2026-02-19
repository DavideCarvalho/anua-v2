import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class CreateInvoiceAsaasChargesCommand extends BaseCommand {
  static commandName = 'asaas:create-invoice-charges'
  static description = 'Create Asaas charges for eligible OPEN invoices (runs synchronously)'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({
    description: 'School ID to filter invoices (optional)',
    required: false,
  })
  declare schoolId?: string

  @flags.number({
    description: 'Month to process (1-12). Defaults to current month.',
  })
  declare month?: number

  @flags.number({ description: 'Year to process. Defaults to current year.' })
  declare year?: number

  async run() {
    const { default: CreateInvoiceAsaasCharges } =
      await import('#start/jobs/create_invoice_asaas_charges')

    this.logger.info(
      this.schoolId
        ? `Creating Asaas charges for school: ${this.schoolId}...`
        : 'Creating Asaas charges for all eligible invoices...'
    )

    try {
      const result = await CreateInvoiceAsaasCharges.handle({
        schoolId: this.schoolId,
        month: this.month,
        year: this.year,
      })

      this.logger.success(
        `Done. Created: ${result.created}, Skipped: ${result.skipped}, Errors: ${result.errors}`
      )
    } catch (error) {
      this.logger.error(`Failed: ${error instanceof Error ? error.message : String(error)}`)
      this.exitCode = 1
    }
  }
}
