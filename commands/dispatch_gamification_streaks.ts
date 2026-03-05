import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import UpdateStreaksJob from '#jobs/gamification/update_streaks_job'

export default class DispatchGamificationStreaks extends BaseCommand {
  static commandName = 'dispatch:gamification-streaks'
  static description = 'Dispatch the UpdateStreaksJob to update student streaks'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Initializing queue manager...')
    this.logger.info('Dispatching UpdateStreaksJob...')
    await UpdateStreaksJob.dispatch({} as never)

    this.logger.success('UpdateStreaksJob dispatched successfully')
  }
}
