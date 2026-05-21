import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import SendDailyAcademicDigestJob from '#jobs/notifications/send_daily_academic_digest_job'
import SendWeeklyAcademicDigestJob from '#jobs/notifications/send_weekly_academic_digest_job'

export default class DispatchSendAcademicDigest extends BaseCommand {
  static commandName = 'dispatch:send-academic-digest'
  static description = 'Dispatch the academic digest email job (daily or weekly)'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({
    description: 'daily (amanhã) ou weekly (próximos 7 dias)',
    default: 'daily',
  })
  declare kind: string

  @flags.boolean({
    description: 'Não envia email nem grava marker — só loga o que enviaria',
    default: false,
  })
  declare dryRun: boolean

  async run() {
    const kind = this.kind === 'weekly' ? 'weekly' : 'daily'
    this.logger.info(`Dispatching ${kind} academic digest (dryRun=${this.dryRun})...`)

    if (kind === 'weekly') {
      await SendWeeklyAcademicDigestJob.dispatch({ dryRun: this.dryRun })
    } else {
      await SendDailyAcademicDigestJob.dispatch({ dryRun: this.dryRun })
    }

    this.logger.success(`Academic digest (${kind}) dispatched`)
  }
}
