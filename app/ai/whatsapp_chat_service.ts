import { generateText, stepCountIs } from 'ai'
import { DateTime } from 'luxon'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { getModel } from './ai_provider.js'
import { getPersona, type SystemPromptContext } from './personas.js'
import { personaFromRole, type ChatPersonaRole } from './chat_role.js'
import { computeChatScope } from './chat_scope.js'
import { toolRegistry } from './tool_registry.js'
import { loadHistoryForChat } from './thread_history.js'
import { maybeSummarizeThread } from './summarize_thread_service.js'
import { recordToolCalls, type StoredToolError } from './record_tool_calls.js'
import { checkQuotaOrDeny } from './usage_quota_service.js'
import { resolveSchoolForUser } from './resolve_school.js'
import './tools/index.js'
import AiThread from '#models/ai_thread'
import AiThreadMessage, {
  type StoredToolCall,
  type StoredToolResult,
} from '#models/ai_thread_message'
import AiTokenUsage from '#models/ai_token_usage'
import School from '#models/school'
import User from '#models/user'

export type WhatsappChatRequest = {
  /** Sender phone, already normalized to digits (no +, no whatsapp: prefix). */
  fromDigits: string
  /** Plain-text body received from the user. */
  body: string
}

export type WhatsappChatResult =
  | { kind: 'reply'; text: string; threadId: string }
  | { kind: 'silent'; reason: string }

const WHATSAPP_FORMAT_RULES = `
FORMATAÇÃO WHATSAPP (importante — esse canal não tem UI gráfica):
- Responda em texto puro. NÃO chame renderResult (não existe pra esse canal).
- Use as marcações que o WhatsApp entende: *negrito*, _itálico_. NÃO use # ou ## de markdown — só asterisco simples.
- Pra valores: "*R$ 1.250,00*" em vez de tabelas. Pra listas, use traços ou número simples.
- Limite resposta a 6-10 linhas se possível. Se a lista for grande, mostre os primeiros 5 itens e ofereça "responder com 'mais' pra ver o resto".
- Use emojis com moderação pra dar contexto (📅 data, 💰 valor, ✅ ok, ⚠️ alerta), nunca como decoração vazia.
- Se a resposta precisa de várias seções, separe com linhas em branco.
`.trim()

export class WhatsappChatService {
  async chat(req: WhatsappChatRequest): Promise<WhatsappChatResult> {
    const candidates = await this.findUsersByPhone(req.fromDigits)
    if (candidates.length === 0) {
      return {
        kind: 'silent',
        reason: `phone ${req.fromDigits} not linked to any user`,
      }
    }

    const user = await this.resolveActiveUser(candidates, req.body)
    if (user === 'ambiguous') {
      return {
        kind: 'reply',
        text: this.buildDisambiguationPrompt(candidates),
        threadId: '',
      }
    }

    if (!user.$preloaded.role) {
      await user.load('role')
    }
    const role = personaFromRole(user.role?.name)
    if (!role) {
      return {
        kind: 'reply',
        text: 'Esse canal ainda não está aberto pro seu perfil. Em breve!',
        threadId: '',
      }
    }

    // user.schoolId vem cru do DB e é NULL pra ~83% dos users (o web supre
    // isso via inertia_middleware, mas o webhook não passa por lá). Aqui
    // resolvemos via UserHasSchool/TeacherHasClass/StudentHasLevel e
    // mutamos user.schoolId in-memory pra tudo downstream funcionar igual.
    const resolvedSchoolId = await resolveSchoolForUser({
      userId: user.id,
      roleName: user.role?.name,
      currentSchoolId: user.schoolId,
    })
    if (!resolvedSchoolId) {
      return {
        kind: 'reply',
        text: 'Você ainda não está vinculado a uma escola no Anua.',
        threadId: '',
      }
    }
    user.schoolId = resolvedSchoolId

    // Quota mensal (NULL = ilimitado, default). Quando estourar, devolve
    // mensagem polida em vez de chamar o LLM.
    const quota = await checkQuotaOrDeny(user.schoolId)
    if (!quota.allowed) {
      return { kind: 'reply', text: quota.reason, threadId: '' }
    }

    const thread = await this.loadOrCreateThread(user.id, user.schoolId, role)
    const scope = await computeChatScope({ role, userId: user.id, schoolId: user.schoolId })

    await AiThreadMessage.create({
      threadId: thread.id,
      role: 'user',
      content: req.body,
    })

    const history = await loadHistoryForChat(thread.id)
    const tools = toolRegistry.forPersona(role, {
      schoolId: user.schoolId,
      userId: user.id,
      scope,
    })
    // WhatsApp não tem UI — renderResult ficaria sem efeito e ainda confunde o
    // modelo. Tiramos do set antes de chamar o LLM.
    delete tools.renderResult

    const school = await School.find(user.schoolId)
    const promptCtx: SystemPromptContext = {
      school: {
        id: user.schoolId,
        name: school?.name ?? 'Escola',
      },
      user: { id: user.id, name: user.name ?? 'Usuário' },
      currentDate: DateTime.now().setZone('America/Sao_Paulo').toFormat('yyyy-LL-dd'),
      scope,
    }

    const persona = getPersona(role)
    const systemPrompt = `${persona.systemPrompt(promptCtx)}\n\n${WHATSAPP_FORMAT_RULES}`

    const modelName = env.get('CROF_MODEL', 'mimo-v2.5-pro')

    try {
      const { text, steps, usage } = await generateText({
        model: getModel(modelName),
        system: systemPrompt,
        messages: history,
        tools: Object.keys(tools).length > 0 ? tools : undefined,
        stopWhen: [stepCountIs(10)],
      })

      const allToolCalls: StoredToolCall[] = steps.flatMap((s) =>
        (s.toolCalls ?? []).map((c) => ({
          toolCallId: c.toolCallId,
          toolName: c.toolName,
          input: c.input,
        }))
      )
      const allToolResults: StoredToolResult[] = steps.flatMap((s) =>
        (s.toolResults ?? []).map((r) => ({
          toolCallId: r.toolCallId,
          toolName: r.toolName,
          output: r.output,
        }))
      )
      const allToolErrors: StoredToolError[] = steps.flatMap((s) =>
        (s.content ?? [])
          .filter((p: { type: string }) => p.type === 'tool-error')
          .map((p) => {
            const err = p as { toolCallId: string; toolName: string; error: unknown }
            return {
              toolCallId: err.toolCallId,
              toolName: err.toolName,
              error:
                err.error instanceof Error
                  ? err.error.message
                  : typeof err.error === 'string'
                    ? err.error
                    : JSON.stringify(err.error),
            }
          })
      )

      const replyText =
        (text ?? '').trim() ||
        'Desculpa, não consegui formular uma resposta agora. Tenta de novo daqui a pouco.'

      const assistantMessage = await AiThreadMessage.create({
        threadId: thread.id,
        role: 'assistant',
        content: replyText,
        toolCalls: allToolCalls.length ? allToolCalls : null,
        toolResults: allToolResults.length ? allToolResults : null,
      })

      if (usage) {
        await AiTokenUsage.create({
          threadId: thread.id,
          messageId: assistantMessage.id,
          userId: user.id,
          schoolId: user.schoolId,
          model: modelName,
          purpose: 'chat',
          inputTokens: usage.inputTokens ?? 0,
          outputTokens: usage.outputTokens ?? 0,
          totalTokens: usage.totalTokens ?? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
        })
      }

      // Audit log: um row por tool call.
      await recordToolCalls({
        threadId: thread.id,
        messageId: assistantMessage.id,
        userId: user.id,
        schoolId: user.schoolId,
        toolCalls: allToolCalls,
        toolResults: allToolResults,
        toolErrors: allToolErrors,
      })

      // Fire-and-forget — threads de WhatsApp são perenes, sumarização
      // periódica evita o histórico estourar tokens com o tempo.
      maybeSummarizeThread(thread.id).catch(() => {})

      return { kind: 'reply', text: replyText, threadId: thread.id }
    } catch (err) {
      logger.error({ err, userId: user.id, phone: req.fromDigits }, 'whatsapp chat failed')
      return {
        kind: 'reply',
        text: 'Tive um problema técnico aqui. Tenta de novo em alguns minutos.',
        threadId: thread.id,
      }
    }
  }

  private async findUsersByPhone(digits: string): Promise<User[]> {
    // Tenta múltiplos formatos: com/sem DDI 55, com/sem 9 na frente do celular.
    // Desde a migration normalize_user_phone, User.phone é guardado só com
    // dígitos — comparação direta, sem regex, e bate no índice
    // idx_user_phone_active.
    const variants = phoneVariants(digits)
    return User.query()
      .whereIn('phone', variants)
      .whereNull('deletedAt')
      .orderBy('createdAt', 'desc')
  }

  /**
   * Quando o número bate em mais de um user (casal compartilhando celular,
   * cadastro duplicado), decide quem está falando. Estratégia stateless:
   *
   * 1. Se já existe uma thread WhatsApp pra UM dos users, mantém esse user
   *    (continuação de conversa).
   * 2. Senão, tenta achar o primeiro nome de um dos candidatos no corpo da
   *    mensagem ("Olá, sou Felipe, ...") — atende de uma vez, sem ping-pong.
   * 3. Senão, devolve 'ambiguous' e o caller envia uma pergunta pedindo
   *    identificação. A próxima mensagem entra de novo nesse mesmo fluxo.
   */
  private async resolveActiveUser(candidates: User[], body: string): Promise<User | 'ambiguous'> {
    if (candidates.length === 1) return candidates[0]!

    // (1) Thread existente — primeira conversa continua, sem perguntar de novo.
    const existing = await AiThread.query()
      .where('channel', 'whatsapp')
      .whereIn(
        'userId',
        candidates.map((u) => u.id)
      )
      .orderBy('createdAt', 'desc')
      .first()
    if (existing) {
      const matched = candidates.find((u) => u.id === existing.userId)
      if (matched) return matched
    }

    // (2) Primeiro nome no corpo. Normaliza pra comparação sem acento/caixa.
    const normalizedBody = normalizeName(body)
    for (const u of candidates) {
      const firstName = (u.name ?? '').trim().split(/\s+/)[0]
      if (!firstName) continue
      const normalizedFirst = normalizeName(firstName)
      // Match por palavra inteira: evita "Ana" bater em "Anastacia".
      const re = new RegExp(`\\b${escapeRegex(normalizedFirst)}\\b`)
      if (re.test(normalizedBody)) return u
    }

    return 'ambiguous'
  }

  private buildDisambiguationPrompt(candidates: User[]): string {
    const names = candidates.map((u) => (u.name ?? '').trim().split(/\s+/)[0]).filter(Boolean)
    const list = names.length > 0 ? names.join(' ou ') : 'a pessoa que está falando'
    return `Olá! Este número está cadastrado pra mais de uma pessoa (${list}). Pra te atender, começa sua mensagem com seu nome — ex: "Sou ${names[0] ?? 'Fulano'}, ...".`
  }

  private async loadOrCreateThread(userId: string, schoolId: string, persona: ChatPersonaRole) {
    const existing = await AiThread.query()
      .where('userId', userId)
      .where('channel', 'whatsapp')
      .orderBy('createdAt', 'desc')
      .first()
    if (existing) return existing

    return AiThread.create({
      userId,
      schoolId,
      persona,
      channel: 'whatsapp',
    })
  }
}

function normalizeName(s: string): string {
  // Lowercase + strip diacritics. Pra comparação resiliente a "José" vs
  // "Jose" ou "ANA" vs "ana" sem mexer no dado original. U+0300–U+036F é
  // o bloco "Combining Diacritical Marks".
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function phoneVariants(digits: string): string[] {
  const set = new Set<string>()
  set.add(digits)

  // Sem DDI 55 → adiciona com
  if (!digits.startsWith('55')) {
    set.add('55' + digits)
  }
  // Com DDI 55 → adiciona sem
  if (digits.startsWith('55') && digits.length > 11) {
    set.add(digits.slice(2))
  }

  // Brasileiro de 11 dígitos sem DDI (DDD + 9 + 8): tenta variante de 10
  if (digits.length === 11 && digits[2] === '9') {
    set.add(digits.slice(0, 2) + digits.slice(3))
  }
  // Brasileiro de 10 dígitos sem DDI: tenta variante com 9 na frente
  if (digits.length === 10) {
    set.add(digits.slice(0, 2) + '9' + digits.slice(2))
  }

  return Array.from(set)
}
