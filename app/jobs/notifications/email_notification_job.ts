import { Job } from '@adonisjs/queue'
import {
  sendEmailNotification,
  type EmailNotificationPayload,
} from '#start/jobs/send_email_notification'

export default class EmailNotificationJob extends Job<EmailNotificationPayload> {
  static readonly jobName = 'EmailNotificationJob'

  static options = {
    queue: 'notifications',
    maxRetries: 3,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 100 },
  }

  async execute(): Promise<void> {
    await sendEmailNotification(this.payload)
  }
}
