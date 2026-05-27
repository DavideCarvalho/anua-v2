import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import GenerateAgreementProposalsJob from '#jobs/payments/generate_agreement_proposals_job'

export default class DispatchGenerateAgreementProposals extends BaseCommand {
  static commandName = 'dispatch:generate-agreement-proposals'
  static description = 'Gera propostas de acordo para faturas com mais de N dias em atraso'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.number({ description: 'Dias mínimos de atraso (default: 15)', alias: 'd' })
  declare days: number | undefined

  async run() {
    const minDays = this.days ?? 15
    this.logger.info(`Despachando job de propostas de acordo (mínimo ${minDays} dias de atraso)...`)
    await GenerateAgreementProposalsJob.dispatch({ minOverdueDays: minDays })
    this.logger.success('Job despachado com sucesso')
  }
}
