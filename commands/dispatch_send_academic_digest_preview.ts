import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import { buildDigestPreview } from '#start/jobs/send_academic_digest'

/**
 * Renderiza o digest pra um aluno específico e envia pra um único email-alvo,
 * sem disparar pros responsáveis reais e sem gravar marker. Usado pra revisar
 * visualmente o template antes de habilitar o cron em prod.
 */
export default class DispatchSendAcademicDigestPreview extends BaseCommand {
  static commandName = 'dispatch:send-academic-digest-preview'
  static description = 'Renderiza o digest e envia pra um email-alvo (preview)'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({ description: 'daily ou weekly', default: 'weekly' })
  declare kind: string

  @flags.string({
    description: 'studentId(s) pra renderizar — separar com vírgula pra simular múltiplos filhos',
  })
  declare studentId: string

  @flags.string({ description: 'tipo do destinatário: responsible (default) ou student' })
  declare as: string

  @flags.string({ description: 'email-alvo pra receber o preview' })
  declare to: string

  async run() {
    const kind = this.kind === 'daily' ? 'daily' : 'weekly'
    if (!this.studentId || !this.to) {
      this.logger.error('Faltou --student-id ou --to')
      this.exitCode = 1
      return
    }

    const studentIds = this.studentId
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const recipientType = this.as === 'student' ? 'student' : 'responsible'

    const preview = await buildDigestPreview({ kind, studentIds, recipientType })
    if (!preview) {
      this.logger.warning('Nenhum aluno com itens na janela — nada pra enviar')
      return
    }

    this.logger.info(
      `Renderizado: ${preview.itemsCount} itens, ${preview.studentNames.length} aluno(s) — ${preview.studentNames.join(', ')} (${kind}, ${recipientType})`
    )

    await mail.send((message) => {
      message
        .from(env.get('SMTP_FROM_EMAIL'))
        .to(this.to)
        .subject(`[PREVIEW] ${preview.subject}`)
        .html(preview.html)
    })

    this.logger.success(`Preview enviado pra ${this.to}`)
  }
}
