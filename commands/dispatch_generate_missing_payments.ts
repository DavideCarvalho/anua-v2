import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { getQueueManager } from '#services/queue_service'
import GenerateMissingPaymentsJob from '#jobs/payments/generate_missing_payments_job'

export default class DispatchGenerateMissingPayments extends BaseCommand {
  static commandName = 'dispatch:generate-missing-payments'
  static description = 'Dispatch the GenerateMissingPaymentsJob to the queue'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Initializing queue manager...')
    await getQueueManager()

    this.logger.info('Dispatching GenerateMissingPaymentsJob...')
    await GenerateMissingPaymentsJob.dispatch({})

    this.logger.success('GenerateMissingPaymentsJob dispatched successfully')
  }
}
