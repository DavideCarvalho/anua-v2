import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import RetryPendingEventsJob from '#jobs/gamification/retry_pending_events_job'

export default class DispatchGamificationRetry extends BaseCommand {
  static commandName = 'dispatch:gamification-retry'
  static description = 'Dispatch the RetryPendingEventsJob to retry failed gamification events'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Initializing queue manager...')
    this.logger.info('Dispatching RetryPendingEventsJob...')
    await RetryPendingEventsJob.dispatch({} as never)

    this.logger.success('RetryPendingEventsJob dispatched successfully')
  }
}
