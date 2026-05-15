import { args, flags, BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import env from '#start/env'
import User from '#models/user'

/**
 * Simula uma chamada da Arara no nosso webhook do WhatsApp pra testar o
 * fluxo de mensagem recebida (event=message.received) sem depender de
 * mensagem real no celular. Útil pra:
 *  - testar o assistente AI sem precisar mandar mensagem no zap
 *  - validar o pipeline (controller -> job -> WhatsappChatService -> reply)
 *  - debugar localmente o que acontece quando alguém manda algo
 *
 * O command resolve o telefone pelo email do user (mesmo lookup que o
 * wa:send), monta o payload no formato que a Arara manda, e dispara um
 * POST no endpoint `/api/v1/whatsapp/webhook` da própria app.
 *
 * Exemplos:
 *   node ace wa:webhook-test fulano@escola.com "oi tudo bem?"
 *   node ace wa:webhook-test fulano@escola.com "" --event=message.status_updated
 *   node ace wa:webhook-test fulano@escola.com "preview" --dry-run
 *   node ace wa:webhook-test --from=13981456345 "oi"  # pula lookup
 */
export default class WaWebhookTest extends BaseCommand {
  static commandName = 'wa:webhook-test'
  static description = 'Simula chamada do webhook da Arara pra testar o fluxo de inbound'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Email do user que manda a mensagem (ou "-" se usar --from)' })
  declare email: string

  @args.string({ description: 'Corpo da mensagem que chegaria do WhatsApp' })
  declare body: string

  @flags.string({
    description:
      'Phone digits-only (sobrescreve lookup por email; ex: 13981456345 ou 5513981456345)',
  })
  declare from?: string

  @flags.string({
    description: 'Evento (default: message.received)',
    default: 'message.received',
  })
  declare event: string

  @flags.string({
    description: 'URL base da app pra disparar o webhook (default: http://localhost:3333)',
    default: 'http://localhost:3333',
  })
  declare url: string

  @flags.string({
    description: 'Token do webhook (default: lê ARARA_WEBHOOK_TOKEN do env)',
  })
  declare secret?: string

  @flags.boolean({ description: 'Não envia — só imprime o payload que seria mandado' })
  declare dryRun: boolean

  async run() {
    // Resolve o telefone: --from ganha; senão busca user pelo email.
    let fromDigits: string
    let resolvedUserLabel: string

    if (this.from) {
      fromDigits = this.from.replace(/\D/g, '')
      resolvedUserLabel = `(via --from)`
    } else {
      const email = this.email.toLowerCase().trim()
      if (!email || email === '-') {
        this.logger.error('Email obrigatório (ou use --from=<digits>)')
        this.exitCode = 1
        return
      }

      const user = await User.query()
        .whereRaw('LOWER(email) = ?', [email])
        .whereNull('deletedAt')
        .first()

      if (!user) {
        this.logger.error(`Usuário com email "${email}" não encontrado.`)
        this.exitCode = 1
        return
      }
      if (!user.phone) {
        this.logger.error(`Usuário ${user.name} (${user.id}) não tem telefone cadastrado.`)
        this.exitCode = 1
        return
      }
      fromDigits = user.phone.replace(/\D/g, '')
      resolvedUserLabel = `${user.name} <${user.email}>`
    }

    // Normaliza o phone do mesmo jeito que o wa:send faz — handleMessageReceived
    // faz strip do "whatsapp:+" pro lookup, então o "from" no payload precisa
    // bater com o que Arara manda. Formato: "whatsapp:+<DDI><DDD><numero>".
    if (fromDigits.length === 11 || fromDigits.length === 10) {
      fromDigits = `55${fromDigits}` // adiciona DDI brasileiro se faltou
    }
    if (fromDigits.length < 12 || fromDigits.length > 13) {
      this.logger.error(`Phone inválido: ${fromDigits} (esperado 12-13 dígitos com DDI)`)
      this.exitCode = 1
      return
    }

    const from = `whatsapp:+${fromDigits}`

    if (this.event === 'message.received' && (!this.body || this.body.trim().length === 0)) {
      this.logger.error('Body obrigatório pra event=message.received.')
      this.exitCode = 1
      return
    }

    // Monta o payload — bate com WhatsAppWebhookController e o
    // processWhatsAppWebhook handler. Pra outros events (status_updated,
    // template.updated) o body é só dica visual; o operador pode passar
    // qualquer string.
    const data: Record<string, unknown> =
      this.event === 'message.received'
        ? { from, body: this.body, id: `test_${Date.now()}` }
        : this.event === 'message.status_updated'
          ? { messageId: this.body || 'ara_msg_test', status: 'DELIVERED' }
          : this.event === 'template.updated'
            ? { name: this.body || 'payment_due_reminder', status: 'APPROVED' }
            : { raw: this.body }

    const secret = this.secret ?? env.get('ARARA_WEBHOOK_TOKEN') ?? ''
    const payload = { event: this.event, data, secret }
    const webhookUrl = `${this.url.replace(/\/$/, '')}/api/v1/whatsapp/webhook`

    this.logger.info(`Destinatário (origem da msg): ${resolvedUserLabel}`)
    this.logger.info(`From:    ${from}`)
    this.logger.info(`Event:   ${this.event}`)
    this.logger.info(`URL:     ${webhookUrl}`)
    this.logger.info(`Payload: ${JSON.stringify(payload, null, 2)}`)

    if (this.dryRun) {
      this.logger.warning('--dry-run: nada foi enviado.')
      return
    }

    if (!secret) {
      this.logger.warning(
        'ARARA_WEBHOOK_TOKEN não setado e --secret não passado — vai bater num token vazio (controller só rejeita se expectedToken estiver setado no env do alvo).'
      )
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const responseText = await response.text().catch(() => '')
      if (response.ok) {
        this.logger.success(
          `Webhook aceito (HTTP ${response.status})${responseText ? ` — body: ${responseText}` : ''}`
        )
        this.logger.info('O job foi enfileirado — confira os logs da app/queue pra ver o processamento.')
      } else {
        this.logger.error(
          `Webhook rejeitou (HTTP ${response.status})${responseText ? `: ${responseText}` : ''}`
        )
        this.exitCode = 1
      }
    } catch (err) {
      this.logger.error(`Falha de rede: ${err instanceof Error ? err.message : String(err)}`)
      this.logger.warning('Dica: a app está rodando na URL passada (--url)?')
      this.exitCode = 1
    }
  }
}
