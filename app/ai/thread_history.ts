import type { ModelMessage } from 'ai'
import AiThread from '#models/ai_thread'
import AiThreadMessage from '#models/ai_thread_message'

/**
 * Carrega o histórico que vai pro modelo:
 * - Se a thread tem contextSummary, vira mensagem 'system' no começo.
 * - Mensagens cruas: só as criadas DEPOIS de summaryUpToMessageId.
 *
 * Resultado: o modelo recebe no máximo KEEP_RECENT mensagens cruas + 1
 * resumo, em vez do histórico inteiro. Mantém latência e custo previsíveis
 * mesmo em threads de WhatsApp que crescem por meses.
 */
export async function loadHistoryForChat(threadId: string): Promise<ModelMessage[]> {
  const thread = await AiThread.find(threadId)
  if (!thread) return []

  const cutoffAt = await cutoffCreatedAt(thread.summaryUpToMessageId)
  const messagesQuery = AiThreadMessage.query().where('threadId', threadId)
  if (cutoffAt) {
    messagesQuery.where('createdAt', '>', cutoffAt)
  }
  const messages = await messagesQuery.orderBy('createdAt', 'asc')

  const history: ModelMessage[] = []
  if (thread.contextSummary) {
    history.push({
      role: 'system',
      content: `Contexto da conversa (resumo das mensagens anteriores):\n${thread.contextSummary}`,
    })
  }
  for (const m of messages) {
    history.push({
      role: m.role as 'user' | 'assistant' | 'system' | 'tool',
      content: m.content ?? '',
    } as ModelMessage)
  }
  return history
}

async function cutoffCreatedAt(lastSummarizedId: string | null): Promise<string | null> {
  if (!lastSummarizedId) return null
  const msg = await AiThreadMessage.query().where('id', lastSummarizedId).first()
  if (!msg) return null
  return msg.createdAt.toSQL() ?? null
}
