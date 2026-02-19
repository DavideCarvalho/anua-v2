import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { getQueueManager } from '#services/queue_service'
import EmitNfseJob from '#jobs/invoices/emit_nfse_job'

export default class DispatchEmitNfse extends BaseCommand {
  static commandName = 'dispatch:emit-nfse'
  static description = 'Dispatch the EmitNfseJob for a specific invoice'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'The invoice ID to emit NFS-e for' })
  declare invoiceId: string

  async run() {
    this.logger.info('Initializing queue manager...')
    await getQueueManager()

    this.logger.info(`Dispatching EmitNfseJob for invoice ${this.invoiceId}...`)
    await EmitNfseJob.dispatch({ invoiceId: this.invoiceId })

    this.logger.success(`EmitNfseJob dispatched for invoice ${this.invoiceId}`)
  }
}
