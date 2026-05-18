import { generateText } from 'ai'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { getModel } from './ai_provider.js'
import AiThread from '#models/ai_thread'
import AiThreadMessage from '#models/ai_thread_message'
import AiTokenUsage from '#models/ai_token_usage'

// Limiar em tokens estimados — switch from "n mensagens" pra "n tokens"
// porque 5 respostas longas estouram a janela bem antes de 30 turnos curtos.
// 8000 tokens deixa folga grande pra todos os modelos atuais (>=32k context).
const SUMMARIZE_AFTER_TOKENS = 8000
// Mantém esse tanto de tokens em texto cru no fim — modelo lê continuidade
// literal. Resto vira resumo.
const KEEP_RECENT_TOKENS = 2000

// Heurística: ~3 chars/token pra português (LLMs em geral assumem 4 pra inglês,
// pt costuma ser ~25% mais denso em chars por palavras compostas/acentos).
// Subestima conservadoramente o número de chars vs token, então erra pra mais
// na contagem — fluxo de resumo dispara um pouco antes do "real". Aceitável.
function estimateTokens(text: string | null | undefined): number {
  if (!text) return 0
  return Math.ceil(text.length / 3)
}

/**
 * Sumariza as mensagens mais antigas de uma thread quando a janela
 * estimada em tokens passa do limiar. Idempotente: chamadas redundantes
 * são no-op. Erros são logados mas não propagados.
 */
export async function maybeSummarizeThread(threadId: string): Promise<void> {
  try {
    const thread = await AiThread.find(threadId)
    if (!thread) return

    const cutoffAt = await cutoffCreatedAt(thread.summaryUpToMessageId)
    const messagesQuery = AiThreadMessage.query().where('threadId', threadId)
    if (cutoffAt) {
      messagesQuery.where('createdAt', '>', cutoffAt)
    }
    const messages = await messagesQuery.orderBy('createdAt', 'asc')

    if (messages.length === 0) return

    const totalTokens = messages.reduce((sum, m) => sum + estimateTokens(m.content), 0)
    if (totalTokens < SUMMARIZE_AFTER_TOKENS) return

    // Walk backwards somando tokens até hit em KEEP_RECENT_TOKENS — tudo
    // ANTES desse ponto vira insumo do resumo. Garante pelo menos 1 msg
    // em toSummarize mesmo se 1 mensagem sozinha estourar KEEP_RECENT.
    let keptTokens = 0
    let keepFromIndex = messages.length
    for (let i = messages.length - 1; i >= 0; i--) {
      const t = estimateTokens(messages[i]!.content)
      if (keptTokens + t > KEEP_RECENT_TOKENS && keepFromIndex < messages.length) break
      keptTokens += t
      keepFromIndex = i
    }
    if (keepFromIndex === 0) return // tudo cabe no "recent"; nada pra resumir
    const toSummarize = messages.slice(0, keepFromIndex)
    const lastSummarized = toSummarize[toSummarize.length - 1]!

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
      {
        threadId,
        summarizedCount: toSummarize.length,
        summarizedTokensEst: totalTokens - keptTokens,
        keptCount: messages.length - toSummarize.length,
        keptTokensEst: keptTokens,
        summaryLen: cleaned.length,
      },
      'thread summarized'
    )
  } catch (err) {
    logger.error({ err, threadId }, 'maybeSummarizeThread failed')
  }
}

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

async function cutoffCreatedAt(lastSummarizedId: string | null): Promise<string | null> {
  if (!lastSummarizedId) return null
  const msg = await AiThreadMessage.query().where('id', lastSummarizedId).first()
  // Mensagem que ancorou o último resumo foi apagada — trata como se não
  // houvesse resumo, força regeração na próxima chamada.
  if (!msg) return null
  return msg.createdAt.toSQL() ?? null
}
