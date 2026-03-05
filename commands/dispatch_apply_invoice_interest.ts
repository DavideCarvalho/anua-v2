import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import ApplyInvoiceInterestJob from '#jobs/payments/apply_invoice_interest_job'

export default class DispatchApplyInvoiceInterest extends BaseCommand {
  static commandName = 'dispatch:apply-invoice-interest'
  static description = 'Dispatch the ApplyInvoiceInterestJob to the queue'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Initializing queue manager...')
    this.logger.info('Dispatching ApplyInvoiceInterestJob...')
    await ApplyInvoiceInterestJob.dispatch({})

    this.logger.success('ApplyInvoiceInterestJob dispatched successfully')
  }
}
