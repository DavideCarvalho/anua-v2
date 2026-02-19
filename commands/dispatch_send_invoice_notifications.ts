import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { getQueueManager } from '#services/queue_service'
import SendInvoiceNotificationsJob from '#jobs/payments/send_invoice_notifications_job'

export default class DispatchSendInvoiceNotifications extends BaseCommand {
  static commandName = 'dispatch:send-invoice-notifications'
  static description = 'Dispatch the SendInvoiceNotificationsJob to the queue'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Initializing queue manager...')
    await getQueueManager()

    this.logger.info('Dispatching SendInvoiceNotificationsJob...')
    await SendInvoiceNotificationsJob.dispatch({})

    this.logger.success('SendInvoiceNotificationsJob dispatched successfully')
  }
}
