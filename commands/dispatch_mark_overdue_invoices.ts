import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { getQueueManager } from '#services/queue_service'
import MarkOverdueInvoicesJob from '#jobs/payments/mark_overdue_invoices_job'

export default class DispatchMarkOverdueInvoices extends BaseCommand {
  static commandName = 'dispatch:mark-overdue-invoices'
  static description = 'Dispatch the MarkOverdueInvoicesJob to the queue'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Initializing queue manager...')
    await getQueueManager()

    this.logger.info('Dispatching MarkOverdueInvoicesJob...')
    await MarkOverdueInvoicesJob.dispatch({})

    this.logger.success('MarkOverdueInvoicesJob dispatched successfully')
  }
}
