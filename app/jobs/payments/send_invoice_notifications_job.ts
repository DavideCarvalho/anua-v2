import { Job } from '@boringnode/queue'
import SendInvoiceNotifications from '#start/jobs/send_invoice_notifications'

interface SendInvoiceNotificationsPayload {
  schoolId?: string
}

export default class SendInvoiceNotificationsJob extends Job<SendInvoiceNotificationsPayload> {
  static readonly jobName = 'SendInvoiceNotificationsJob'

  static options = {
    queue: 'payments',
    maxRetries: 2,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    await SendInvoiceNotifications.handle(this.payload)
  }
}
