import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { getQueueManager } from '#services/queue_service'
import SendOccurrenceAckRemindersJob from '#jobs/occurrences/send_occurrence_ack_reminders_job'

export default class DispatchSendOccurrenceAckReminders extends BaseCommand {
  static commandName = 'dispatch:send-occurrence-ack-reminders'
  static description = 'Dispatch reminder emails for pending occurrence acknowledgements'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Initializing queue manager...')
    await getQueueManager()

    this.logger.info('Dispatching SendOccurrenceAckRemindersJob...')
    await SendOccurrenceAckRemindersJob.dispatch({})

    this.logger.success('SendOccurrenceAckRemindersJob dispatched successfully')
  }
}
