import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class GenerateMissingPaymentsCommand extends BaseCommand {
  static commandName = 'payments:generate-missing'
  static description = 'Generate missing student payments. Optionally filter by school ID.'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'School ID to generate payments for (optional)', required: false })
  declare schoolId?: string

  async run() {
    const { default: GenerateMissingPayments } =
      await import('#start/jobs/generate_missing_payments')

    const schoolId = this.schoolId || undefined

    this.logger.info(
      schoolId
        ? `Running missing payments generation for school ${schoolId}...`
        : 'Running missing payments generation for all schools...'
    )

    try {
      const result = await GenerateMissingPayments.handle({ schoolId, inline: true })
      this.logger.success(
        `Done. Total: ${result.total}, Dispatched: ${result.dispatched}, Errors: ${result.errors}`
      )
    } catch (error) {
      this.logger.error(`Failed: ${error instanceof Error ? error.message : String(error)}`)
      this.exitCode = 1
    }
  }
}
