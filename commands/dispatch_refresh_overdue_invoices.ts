import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { getQueueManager } from '#services/queue_service'
import RefreshOverdueInvoicesJob from '#jobs/payments/refresh_overdue_invoices_job'

export default class DispatchRefreshOverdueInvoices extends BaseCommand {
  static commandName = 'dispatch:refresh-overdue-invoices'
  static description =
    'Dispatch the RefreshOverdueInvoicesJob (mark overdue + apply interest) to the queue'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Initializing queue manager...')
    await getQueueManager()

    this.logger.info('Dispatching RefreshOverdueInvoicesJob...')
    await RefreshOverdueInvoicesJob.dispatch({})

    this.logger.success('RefreshOverdueInvoicesJob dispatched successfully')
  }
}
