import { generateText } from 'ai'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { getModel } from './ai_provider.js'
import AiThread from '#models/ai_thread'
import AiThreadMessage from '#models/ai_thread_message'
import AiTokenUsage from '#models/ai_token_usage'

// Quando contar > SUMMARIZE_AFTER mensagens não-resumidas, dispara a
// sumarização. Mantemos as últimas KEEP_RECENT mensagens cruas e jogamos o
// resto no resumo. Esses valores foram escolhidos pra dar contexto suficiente
// pro modelo entender continuidade sem estourar tokens em threads de
// WhatsApp que rodam pra sempre.
const SUMMARIZE_AFTER = 30
const KEEP_RECENT = 10

const SUMMARY_SYSTEM_PROMPT = `
Você está condensando uma conversa entre um usuário e um assistente IA escolar.
Seu trabalho é gerar um RESUMO em texto corrido (não bullet points) que preserve:

- Quem é o usuário e qual escola/turma/aluno está sendo discutido
- Decisões já tomadas, valores já compartilhados, IDs já resolvidos
- Tom da conversa e nível de formalidade
- Qualquer informação importante que o assistente vai precisar pra continuar sem repetir o histórico inteiro

Regras:
- Máx 6-8 linhas. Cada palavra precisa carregar peso.
- 3ª pessoa ("O usuário pediu..."), português, sem aspas.
- Se já existe um resumo prévio, ele vem PRIMEIRO e você só ESTENDE com o novo conteúdo — nunca repita o que já está no resumo prévio.
- Não invente: se não tem certeza, deixe de fora.
`.trim()

/**
 * Sumariza as mensagens mais antigas de uma thread quando ela cresce demais.
 * Idempotente: se não há motivo pra sumarizar (poucas mensagens novas), no-op.
 * Erros são logados mas não propagados — sumarização é melhoria de
 * performance, não correção, e se falhar a próxima tentativa pega.
 */
export async function maybeSummarizeThread(threadId: string): Promise<void> {
  try {
    const thread = await AiThread.find(threadId)
    if (!thread) return

    const newSinceSummary = await countMessagesAfter(threadId, thread.summaryUpToMessageId)
    if (newSinceSummary < SUMMARIZE_AFTER) return

    // Pega todas as mensagens depois do último resumo, ordenadas por criação.
    // Resumimos tudo MENOS as últimas KEEP_RECENT, que ficam cruas pra o
    // modelo ver a continuação literal.
    const cutoffAt = await cutoffCreatedAt(thread.summaryUpToMessageId)
    const messagesQuery = AiThreadMessage.query().where('threadId', threadId)
    if (cutoffAt) {
      messagesQuery.where('createdAt', '>', cutoffAt)
    }
    const messages = await messagesQuery.orderBy('createdAt', 'asc')

    if (messages.length <= KEEP_RECENT) return

    const toSummarize = messages.slice(0, messages.length - KEEP_RECENT)
    const lastSummarized = toSummarize[toSummarize.length - 1]

    const conversationText = toSummarize
      .map((m) => `[${m.role}] ${m.content?.slice(0, 800) ?? ''}`)
      .join('\n\n')

    const priorSummary = thread.contextSummary
      ? `Resumo prévio:\n${thread.contextSummary}\n\nNova parte da conversa pra incorporar:\n`
      : 'Conversa pra resumir:\n'

    const modelName = env.get('CROF_MODEL', 'mimo-v2.5-pro')
    const { text, usage } = await generateText({
      model: getModel(modelName),
      system: SUMMARY_SYSTEM_PROMPT,
      prompt: `${priorSummary}${conversationText}`,
    })

    const cleaned = text.trim()
    if (!cleaned) {
      logger.warn({ threadId }, 'summarizeThread: model returned empty text')
      return
    }

    thread.contextSummary = cleaned
    thread.summaryUpToMessageId = lastSummarized.id
    await thread.save()

    if (usage) {
      await AiTokenUsage.create({
        threadId,
        messageId: null,
        userId: thread.userId,
        schoolId: thread.schoolId ?? '',
        model: modelName,
        purpose: 'summary',
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
        totalTokens: usage.totalTokens ?? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
      })
    }

    logger.info(
      { threadId, summarizedCount: toSummarize.length, summaryLen: cleaned.length },
      'thread summarized'
    )
  } catch (err) {
    logger.error({ err, threadId }, 'maybeSummarizeThread failed')
  }
}

async function countMessagesAfter(threadId: string, lastSummarizedId: string | null): Promise<number> {
  const cutoffAt = await cutoffCreatedAt(lastSummarizedId)
  const query = AiThreadMessage.query().where('threadId', threadId)
  if (cutoffAt) {
    query.where('createdAt', '>', cutoffAt)
  }
  const result = await query.count('* as total').first()
  return Number(result?.$extras?.total ?? 0)
}

async function cutoffCreatedAt(lastSummarizedId: string | null): Promise<string | null> {
  if (!lastSummarizedId) return null
  const msg = await AiThreadMessage.query().where('id', lastSummarizedId).first()
  // Mensagem que ancorou o último resumo foi apagada — trata como se não
  // houvesse resumo, força regeração na próxima chamada.
  if (!msg) return null
  return msg.createdAt.toSQL() ?? null
}
