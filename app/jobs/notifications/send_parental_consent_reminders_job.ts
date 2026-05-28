import { Job } from '@adonisjs/queue'
import { sendParentalConsentReminders } from '#start/jobs/send_parental_consent_reminders'

interface Payload {
  dryRun?: boolean
}

/**
 * Lembrete diário (10h BR) de autorização parental pendente pra eventos que
 * acontecem em até 3 dias. Multi-canal via NotificationService.
 */
export default class SendParentalConsentRemindersJob extends Job<Payload> {
  static readonly jobName = 'SendParentalConsentRemindersJob'

  static options = {
    queue: 'notifications',
    maxRetries: 2,
    removeOnComplete: { count: 60 },
    removeOnFail: { count: 60 },
  }

  async execute(): Promise<void> {
    await sendParentalConsentReminders({ dryRun: this.payload?.dryRun ?? false })
  }
}
