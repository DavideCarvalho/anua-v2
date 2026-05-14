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
import { recordToolCalls } from './record_tool_calls.js'
import { checkQuotaOrDeny } from './usage_quota_service.js'
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
    const user = await this.findUserByPhone(req.fromDigits)
    if (!user) {
      return {
        kind: 'silent',
        reason: `phone ${req.fromDigits} not linked to any user`,
      }
    }

    if (!user.schoolId) {
      return { kind: 'reply', text: 'Você ainda não está vinculado a uma escola no Anua.', threadId: '' }
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

    const promptCtx: SystemPromptContext = {
      school: {
        id: user.schoolId,
        name: (await School.find(user.schoolId))?.name ?? 'Escola',
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

      const replyText = (text ?? '').trim() || 'Desculpa, não consegui formular uma resposta agora. Tenta de novo daqui a pouco.'

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
          totalTokens:
            usage.totalTokens ?? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
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

  private async findUserByPhone(digits: string): Promise<User | null> {
    // Tenta múltiplos formatos: com/sem DDI 55, com/sem 9 na frente do celular.
    // A coluna User.phone pode estar guardada formatada ("(11) 99999-0000"),
    // então comparamos só dígitos via regex no SQL.
    const variants = phoneVariants(digits)
    const user = await User.query()
      .where((q) => {
        for (const v of variants) {
          q.orWhereRaw(`regexp_replace(coalesce(phone, ''), '\\D', '', 'g') = ?`, [v])
        }
      })
      .whereNull('deletedAt')
      .first()
    return user
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
