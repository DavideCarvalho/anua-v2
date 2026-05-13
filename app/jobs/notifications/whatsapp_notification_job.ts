import { Job } from '@adonisjs/queue'
import {
  sendWhatsAppNotification,
  type WhatsAppNotificationPayload,
} from '#start/jobs/send_whatsapp_notification'

export default class WhatsAppNotificationJob extends Job<WhatsAppNotificationPayload> {
  static readonly jobName = 'WhatsAppNotificationJob'

  static options = {
    queue: 'notifications',
    maxRetries: 3,
    retryDelay: 30,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 100 },
  }

  async execute(): Promise<void> {
    await sendWhatsAppNotification(this.payload)
  }
}
