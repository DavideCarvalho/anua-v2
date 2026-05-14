import { args, flags, BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import { getAraraService, AraraApiError } from '#services/arara_service'

/**
 * Manda mensagem de WhatsApp pra um user da plataforma identificado por
 * email. Útil pra debug/teste manual (acordar uma janela de sessão pra
 * testar o assistente, mandar aviso pra um user específico, etc).
 *
 * Por padrão usa SESSION message (texto livre) — funciona se o user já
 * abriu janela de 24h com a gente. Pra cold outreach (sem janela aberta)
 * passe --template <nome>; o template precisa estar aprovado na Arara/Meta.
 *
 * Exemplos:
 *   node ace wa:send fulano@escola.com "Oi! Tudo certo?"
 *   node ace wa:send fulano@escola.com "" --template=payment_due_reminder \\
 *     --variables="João,Ana,15/05,150.00"
 *   node ace wa:send fulano@escola.com "preview" --dry-run
 */
export default class SendWhatsapp extends BaseCommand {
  static commandName = 'wa:send'
  static description = 'Manda mensagem de WhatsApp pra um user da plataforma pelo email'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Email do destinatário (case-insensitive)' })
  declare email: string

  @args.string({
    description: 'Corpo da mensagem (ignored se --template; use "" pra omitir)',
    required: false,
  })
  declare body: string

  @flags.string({ description: 'Nome do template aprovado na Arara (cold outreach)' })
  declare template?: string

  @flags.string({
    description: 'Variáveis do template separadas por vírgula (ex: "João,Ana,15/05")',
  })
  declare variables?: string

  @flags.boolean({ description: 'Não envia — só imprime o que seria enviado' })
  declare dryRun: boolean

  async run() {
    const email = this.email.toLowerCase().trim()
    if (!email) {
      this.logger.error('Email é obrigatório')
      this.exitCode = 1
      return
    }

    // Email é unique a nível de schema; usamos query case-insensitive
    // porque users velhos podem ter cadastros com case misto.
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

    // Phone foi normalizado pra digits-only pela migration normalize_user_phone,
    // mas defendemos contra cadastros legados de qualquer forma.
    let digits = user.phone.replace(/\D/g, '')
    // Tira DDI Brasil se já tiver (61 9999 ou 5561 9999 dão receiver
    // diferente — queremos sempre normalizar pra "11 dígitos sem 55").
    if (digits.length === 13 && digits.startsWith('55')) digits = digits.slice(2)
    if (digits.length === 12 && digits.startsWith('55')) digits = digits.slice(2)
    if (digits.length < 10 || digits.length > 11) {
      this.logger.error(
        `Telefone inválido pro user ${user.name}: "${user.phone}" (após strip: "${digits}").`
      )
      this.exitCode = 1
      return
    }

    const receiver = `whatsapp:+55${digits}`

    const isTemplate = !!this.template
    if (!isTemplate && (!this.body || this.body.trim().length === 0)) {
      this.logger.error('Body é obrigatório quando não está usando --template.')
      this.exitCode = 1
      return
    }

    // Resumo do envio antes de disparar
    this.logger.info(`Destinatário: ${user.name} <${user.email}>`)
    this.logger.info(`Telefone:     ${receiver}`)
    if (isTemplate) {
      const vars = this.variables ? this.variables.split(',').map((v) => v.trim()) : []
      this.logger.info(`Template:     ${this.template}`)
      this.logger.info(`Variáveis:    ${JSON.stringify(vars)}`)
    } else {
      this.logger.info(`Mensagem:     ${this.body}`)
    }

    if (this.dryRun) {
      this.logger.warning('--dry-run: nada foi enviado.')
      return
    }

    const arara = getAraraService()
    try {
      if (isTemplate) {
        const vars = this.variables ? this.variables.split(',').map((v) => v.trim()) : []
        const res = await arara.sendTemplate({
          receiver,
          templateName: this.template!,
          variables: vars,
        })
        this.logger.success(`Template enviado. messageId=${res.id} status=${res.status}`)
      } else {
        const res = await arara.sendSessionMessage({ receiver, body: this.body })
        this.logger.success(`Mensagem enviada. messageId=${res.id} status=${res.status}`)
      }
    } catch (err) {
      if (err instanceof AraraApiError) {
        this.logger.error(`Arara recusou (HTTP ${err.status}): ${err.message}`)
        // Dica comum: session message só funciona com janela de 24h aberta.
        // Arara devolve 422 com "Nenhuma conversa iniciada..." nesse caso.
        if (!isTemplate && (err.status === 400 || err.status === 422)) {
          this.logger.warning(
            'Dica: sessão de 24h pode estar fechada. Use --template <nome_aprovado> ou peça pro user mandar uma mensagem pro número antes (abre janela).'
          )
        }
      } else {
        this.logger.error(`Falha inesperada: ${err instanceof Error ? err.message : String(err)}`)
      }
      this.exitCode = 1
    }
  }
}
