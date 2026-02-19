import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { getQueueManager } from '#services/queue_service'
import CreateInvoiceAsaasChargesJob from '#jobs/payments/create_invoice_asaas_charges_job'

export default class DispatchCreateInvoiceAsaasCharges extends BaseCommand {
  static commandName = 'dispatch:create-invoice-asaas-charges'
  static description = 'Dispatch the CreateInvoiceAsaasChargesJob to the queue'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Initializing queue manager...')
    await getQueueManager()

    this.logger.info('Dispatching CreateInvoiceAsaasChargesJob...')
    await CreateInvoiceAsaasChargesJob.dispatch({})

    this.logger.success('CreateInvoiceAsaasChargesJob dispatched successfully')
  }
}
