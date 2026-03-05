import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import GenerateSubscriptionInvoicesJob from '#jobs/payments/generate_subscription_invoices_job'

export default class DispatchGenerateSubscriptionInvoices extends BaseCommand {
  static commandName = 'dispatch:generate-subscription-invoices'
  static description = 'Dispatch the GenerateSubscriptionInvoicesJob to the queue'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Initializing queue manager...')
    this.logger.info('Dispatching GenerateSubscriptionInvoicesJob...')
    await GenerateSubscriptionInvoicesJob.dispatch({})

    this.logger.success('GenerateSubscriptionInvoicesJob dispatched successfully')
  }
}
