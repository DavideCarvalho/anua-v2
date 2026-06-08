import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { changelog } from '../app/changelog/changelog_data.js'
import SendChangelogDigestJob from '#jobs/notifications/send_changelog_digest_job'

export default class SendChangelogDigest extends BaseCommand {
  static commandName = 'changelog:send-digest'
  static description =
    'Gera emails personalizados por IA pra cada perfil e envia o digest de novidades'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({ description: 'ID da release (default: mais recente)', alias: 'r' })
  declare release: string | undefined

  @flags.boolean({ description: 'Só mostra o que seria enviado, sem enviar', alias: 'd' })
  declare dryRun: boolean

  async run() {
    const releaseId = this.release ?? changelog[0]?.id
    if (!releaseId) {
      this.logger.error('Nenhuma release encontrada no changelog')
      return
    }

    const entry = changelog.find((e) => e.id === releaseId)
    if (!entry) {
      this.logger.error(
        `Release "${releaseId}" não encontrada. Disponíveis: ${changelog.map((e) => e.id).join(', ')}`
      )
      return
    }

    this.logger.info(`Release: ${entry.title} (${entry.id})`)
    this.logger.info(`Total de items: ${entry.items.length}`)

    const responsavelItems = entry.items.filter(
      (i) => i.audience === 'responsavel' || i.audience === 'all'
    )
    const escolaItems = entry.items.filter((i) => i.audience === 'escola' || i.audience === 'all')
    const adminItems = entry.items.filter((i) => i.audience === 'admin' || i.audience === 'all')

    this.logger.info(`  Responsável: ${responsavelItems.length} items`)
    this.logger.info(`  Escola: ${escolaItems.length} items`)
    this.logger.info(`  Admin: ${adminItems.length} items`)

    if (this.dryRun) {
      this.logger.info('Dry run: nenhum email será enviado')
      return
    }

    await SendChangelogDigestJob.dispatch({
      entries: [{ title: entry.title, items: entry.items }],
    })

    this.logger.success(
      'Job de digest enfileirado! A IA vai gerar o texto e os emails serão enviados em background.'
    )
  }
}
