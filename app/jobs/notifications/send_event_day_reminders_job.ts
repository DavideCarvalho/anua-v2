import { Job } from '@adonisjs/queue'
import { sendEventDayReminders } from '#start/jobs/send_event_day_reminders'

interface Payload {
  dryRun?: boolean
}

/**
 * Push matinal (7h BR) lembrando eventos importantes que acontecem HOJE.
 * Critério estrito: PARENTS_MEETING, FIELD_TRIP, eventos com autorização
 * parental ou prioridade HIGH/URGENT. Agrupa por usuário pra não spammar.
 */
export default class SendEventDayRemindersJob extends Job<Payload> {
  static readonly jobName = 'SendEventDayRemindersJob'

  static options = {
    queue: 'notifications',
    maxRetries: 2,
    removeOnComplete: { count: 60 },
    removeOnFail: { count: 60 },
  }

  async execute(): Promise<void> {
    await sendEventDayReminders({ dryRun: this.payload?.dryRun ?? false })
  }
}
