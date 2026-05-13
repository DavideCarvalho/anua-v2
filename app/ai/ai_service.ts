import { streamText, generateText, type ModelMessage } from 'ai'
import { getModel } from './ai_provider.js'
import { getPersona } from './personas.js'
import { toolRegistry } from './tool_registry.js'
import AiThread from '#models/ai_thread'
import AiThreadMessage from '#models/ai_thread_message'

export class AiService {
  async chat(
    threadId: string | undefined,
    message: string,
    personaId: string,
    ctx: { schoolId: string; userId: string; onChunk?: (text: string) => void; onDone?: () => void; onComponent?: (name: string, data: any) => void }
  ) {
    const persona = getPersona(personaId)
    const thread = await this.loadOrCreateThread(threadId, personaId, ctx)
    const history = await this.loadThreadHistory(thread.id)

    await AiThreadMessage.create({
      threadId: thread.id,
      role: 'user',
      content: message,
    })

    const tools = toolRegistry.forPersona(personaId, { schoolId: ctx.schoolId, userId: ctx.userId })

    const result = streamText({
      model: getModel(),
      system: persona.systemPrompt,
      messages: [...history, { role: 'user' as const, content: message }],
      tools: Object.keys(tools).length > 0 ? tools : undefined,
      onChunk: ctx.onChunk
        ? ({ chunk }) => {
            if (chunk.type === 'text-delta' && chunk.text) {
              ctx.onChunk!(chunk.text)
            }
          }
        : undefined,
      onFinish: async ({ text, toolResults }) => {
        ctx.onDone?.()
        if (toolResults && toolResults.length > 0 && ctx.onComponent) {
          for (const tr of toolResults) {
            ctx.onComponent(tr.toolName, (tr as any).result)
          }
        }
        if (text) {
          await AiThreadMessage.create({
            threadId: thread.id,
            role: 'assistant',
            content: text,
          })
        }
        if (!thread.title) {
          this.generateThreadTitle(thread.id, message).catch(() => {})
        }
      },
    })

    return result
  }

  async generate(systemPrompt: string, messages: Array<{ role: string; content: string }>) {
    const { text } = await generateText({
      model: getModel('gpt-4o-mini'),
      system: systemPrompt,
      messages: messages as unknown as ModelMessage[],
    })
    return text
  }

  private async loadOrCreateThread(
    threadId: string | undefined,
    personaId: string,
    ctx: { schoolId: string; userId: string }
  ) {
    if (threadId) {
      const thread = await AiThread.find(threadId)
      if (thread) return thread
    }
    return AiThread.create({
      schoolId: ctx.schoolId,
      userId: ctx.userId,
      persona: personaId,
    })
  }

  private async loadThreadHistory(threadId: string): Promise<ModelMessage[]> {
    const messages = await AiThreadMessage.query()
      .where('threadId', threadId)
      .orderBy('createdAt', 'asc')

    return messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system' | 'tool',
      content: m.content ?? '',
    })) as ModelMessage[]
  }

  private async generateThreadTitle(threadId: string, firstMessage: string) {
    const { text } = await generateText({
      model: getModel('gpt-4o-mini'),
      system:
        'Gere um título curto (máximo 6 palavras) para esta conversa. Responda apenas o título, sem aspas.',
      messages: [{ role: 'user' as const, content: firstMessage }],
    })
    await AiThread.query().where('id', threadId).update({ title: text.trim() })
  }
}
