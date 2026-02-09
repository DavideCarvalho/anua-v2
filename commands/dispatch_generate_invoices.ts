import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { getQueueManager } from '#services/queue_service'
import GenerateInvoicesJob from '#jobs/payments/generate_invoices_job'

export default class DispatchGenerateInvoices extends BaseCommand {
  static commandName = 'dispatch:generate-invoices'
  static description = 'Dispatch the GenerateInvoicesJob to the queue'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Initializing queue manager...')
    await getQueueManager()

    this.logger.info('Dispatching GenerateInvoicesJob...')
    await GenerateInvoicesJob.dispatch({})

    this.logger.success('GenerateInvoicesJob dispatched successfully')
  }
}
