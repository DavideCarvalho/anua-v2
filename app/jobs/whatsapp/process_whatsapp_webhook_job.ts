import { Job } from '@adonisjs/queue'
import { processWhatsAppWebhook, WhatsAppWebhookPayload } from '#start/jobs/process_whatsapp_webhook'

export default class ProcessWhatsAppWebhookJob extends Job<WhatsAppWebhookPayload> {
  static readonly jobName = 'ProcessWhatsAppWebhookJob'

  static options = {
    queue: 'notifications',
    maxRetries: 3,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 100 },
  }

  async execute(): Promise<void> {
    await processWhatsAppWebhook(this.payload)
  }
}
