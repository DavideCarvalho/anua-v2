import {
  streamText,
  generateText,
  stepCountIs,
  hasToolCall,
  type ModelMessage,
  type UIMessage,
  type StreamTextResult,
  type ToolSet,
} from 'ai'
import { DateTime } from 'luxon'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { getModel } from './ai_provider.js'
import { getPersona, type SystemPromptContext } from './personas.js'
import type { ChatScope } from './chat_scope.js'
import { toolRegistry } from './tool_registry.js'
import { loadHistoryForChat } from './thread_history.js'
import { maybeSummarizeThread } from './summarize_thread_service.js'
import { recordToolCalls, type StoredToolError } from './record_tool_calls.js'
import { getCachedSchool, getCachedUser } from './prompt_context_cache.js'
import './tools/index.js'
import AiThread from '#models/ai_thread'
import AiThreadMessage, {
  type StoredToolCall,
  type StoredToolResult,
} from '#models/ai_thread_message'
import AiTokenUsage from '#models/ai_token_usage'

export type ChatRequest = {
  threadId: string
  personaId: string
  schoolId: string
  userId: string
  userMessage: UIMessage
  scope: ChatScope
  abortSignal?: AbortSignal
  // Origem da thread: 'page' (chat fullscreen /escola/ia) ou 'sheet'
  // (assistente contextual aberto a partir de outras telas). Default
  // 'page' mantém comportamento histórico.
  surface?: 'page' | 'sheet'
}

export type ChatResult = {
  result: StreamTextResult<ToolSet, never>
  threadId: string
}

export class AiService {
  async chat(req: ChatRequest): Promise<ChatResult> {
    const persona = getPersona(req.personaId)
    const thread = await this.loadOrCreateThread(req)
    const userText = this.extractText(req.userMessage)
    const promptCtx = await this.buildPromptContext(req)

    await AiThreadMessage.create({
      threadId: thread.id,
      role: 'user',
      content: userText,
    })

    const history = await this.loadThreadHistory(thread.id)
    const tools = toolRegistry.forPersona(req.personaId, {
      schoolId: req.schoolId,
      userId: req.userId,
      scope: req.scope,
    })
    const modelName = env.get('CROF_MODEL', 'mimo-v2.5-pro')

    // Tracing: timestamp do último boundary de step pra calcular latência
    // por step. streamText não dá duração nativa — medimos no JS mesmo.
    // chatStartedAt ancora o primeiro step (não tem step anterior).
    const chatStartedAt = Date.now()
    let lastStepEndedAt = chatStartedAt

    const result = streamText({
      model: getModel(modelName),
      system: persona.systemPrompt(promptCtx),
      messages: history,
      tools: Object.keys(tools).length > 0 ? tools : undefined,
      // Two-way stop: bail out as soon as the model calls renderResult
      // (the answer is "shown"), and hard-cap at 20 steps as a runaway
      // guard for chains that never reach renderResult.
      stopWhen: [stepCountIs(20), hasToolCall('renderResult')],
      abortSignal: req.abortSignal,
      onStepFinish: (step) => {
        const now = Date.now()
        const stepDurationMs = now - lastStepEndedAt
        lastStepEndedAt = now
        // Estrutura plana otimizada pra agregação em log aggregators —
        // cada chave é facilmente filtrável (threadId, persona, tool).
        logger.info(
          {
            event: 'ai_step',
            threadId: thread.id,
            schoolId: req.schoolId,
            userId: req.userId,
            persona: req.personaId,
            model: modelName,
            stepNumber: step.stepNumber,
            finishReason: step.finishReason,
            durationMs: stepDurationMs,
            inputTokens: step.usage?.inputTokens ?? 0,
            outputTokens: step.usage?.outputTokens ?? 0,
            totalTokens:
              step.usage?.totalTokens ?? (step.usage?.inputTokens ?? 0) + (step.usage?.outputTokens ?? 0),
            toolCallNames: step.toolCalls.map((c) => c.toolName),
            toolCallCount: step.toolCalls.length,
            textLength: step.text.length,
          },
          'ai chat step finished'
        )
      },
      onFinish: async ({ text, steps, usage }) => {
        const totalDurationMs = Date.now() - chatStartedAt
        logger.info(
          {
            event: 'ai_chat_finished',
            threadId: thread.id,
            schoolId: req.schoolId,
            userId: req.userId,
            persona: req.personaId,
            model: modelName,
            stepCount: steps.length,
            totalDurationMs,
            totalInputTokens: usage?.inputTokens ?? 0,
            totalOutputTokens: usage?.outputTokens ?? 0,
            totalTokens:
              usage?.totalTokens ?? (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
          },
          'ai chat finished'
        )
        try {
          // streamText.onFinish returns toolCalls/toolResults from the LAST step
          // only. With multi-step runs that end on a text-only step (e.g. after
          // renderResult fires), the aggregate is empty — meaning a refresh
          // would lose every tool block we just streamed to the client. We flatten
          // across all steps to preserve the full call/result history.
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
          // SDK v6+ emite parts com type='tool-error' dentro de step.content
          // sempre que execute() lança exception. Esses calls NÃO aparecem em
          // step.toolResults — sem agregar daqui, o audit grava status=failed
          // com error null (foi o que mascarou o bug do "ExamGrade"). Cada
          // part traz toolCallId/toolName/input/error.
          const allToolErrors: StoredToolError[] = steps.flatMap((s) =>
            (s.content ?? [])
              .filter((p: { type: string }) => p.type === 'tool-error')
              .map((p) => {
                const err = (p as { toolCallId: string; toolName: string; error: unknown })
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
          if (allToolErrors.length > 0) {
            logger.error(
              {
                event: 'ai_tool_errors',
                threadId: thread.id,
                schoolId: req.schoolId,
                userId: req.userId,
                count: allToolErrors.length,
                errors: allToolErrors.map((e) => ({
                  toolName: e.toolName,
                  error: e.error.slice(0, 500),
                })),
              },
              `${allToolErrors.length} tool execution error(s) in this run`
            )
          }
          const assistantMessage = await AiThreadMessage.create({
            threadId: thread.id,
            role: 'assistant',
            content: text ?? '',
            toolCalls: allToolCalls.length ? allToolCalls : null,
            toolResults: allToolResults.length ? allToolResults : null,
          })

          if (usage) {
            await AiTokenUsage.create({
              threadId: thread.id,
              messageId: assistantMessage.id,
              userId: req.userId,
              schoolId: req.schoolId,
              model: modelName,
              purpose: 'chat',
              inputTokens: usage.inputTokens ?? 0,
              outputTokens: usage.outputTokens ?? 0,
              totalTokens:
                usage.totalTokens ?? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
            })
          }

          if (!thread.title) {
            this.generateThreadTitle(thread.id, userText, req).catch(() => {})
          }

          // Audit log: um row por tool call. Roda DEPOIS do
          // AiThreadMessage.create() porque cada AiToolCall referencia o
          // messageId. Não bloqueia o retorno em caso de falha.
          await recordToolCalls({
            threadId: thread.id,
            messageId: assistantMessage.id,
            userId: req.userId,
            schoolId: req.schoolId,
            toolCalls: allToolCalls,
            toolResults: allToolResults,
            toolErrors: allToolErrors,
          })

          // Fire-and-forget — sumarização não bloqueia a resposta. Se a
          // thread acumulou mensagens suficientes, condensa as antigas pra
          // manter o histórico mandado pro modelo dentro do limite.
          maybeSummarizeThread(thread.id).catch(() => {})
        } catch (err) {
          console.error('[ai_service.onFinish] FAILED', err)
        }
      },
    })

    return { result, threadId: thread.id }
  }

  private async buildPromptContext(req: ChatRequest): Promise<SystemPromptContext> {
    // Cacheado em memória (TTL 60s) — School+User mudam raramente e essa
    // função roda em todo turno do chat.
    const [school, user] = await Promise.all([
      getCachedSchool(req.schoolId),
      getCachedUser(req.userId),
    ])
    return {
      school: { id: req.schoolId, name: school?.name ?? 'Escola sem nome' },
      user: { id: req.userId, name: user?.name ?? 'Usuário' },
      currentDate: DateTime.now().setZone('America/Sao_Paulo').toFormat('yyyy-LL-dd'),
      scope: req.scope,
    }
  }

  private extractText(message: UIMessage): string {
    const parts = message.parts ?? []
    return parts
      .filter((p): p is Extract<UIMessage['parts'][number], { type: 'text' }> => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }

  private async loadOrCreateThread(req: ChatRequest) {
    const existing = await AiThread.query()
      .where('id', req.threadId)
      .where('userId', req.userId)
      .first()
    if (existing) return existing

    return AiThread.create({
      id: req.threadId,
      schoolId: req.schoolId,
      userId: req.userId,
      persona: req.personaId,
      surface: req.surface ?? 'page',
    })
  }

  private async loadThreadHistory(threadId: string): Promise<ModelMessage[]> {
    return loadHistoryForChat(threadId)
  }

  private async generateThreadTitle(threadId: string, firstMessage: string, req: ChatRequest) {
    const titleModel = env.get('CROF_MODEL', 'mimo-v2.5-pro')
    const { text, usage } = await generateText({
      model: getModel(titleModel),
      // Phrased as a labeling task with a concrete output contract — otherwise
      // the model treats the user's question as something to answer (and we
      // ended up with refusals like "Não tenho acesso a dados..." as titles).
      system: [
        'Você recebe a PRIMEIRA mensagem de uma nova conversa e devolve um título curto que descreva o ASSUNTO dessa mensagem.',
        '',
        'Regras:',
        '- Máximo de 6 palavras, em português.',
        '- NÃO responda à pergunta. NÃO recuse. NÃO peça mais informação.',
        '- Apenas resuma o tópico em um rótulo (ex.: "Inadimplência por turma", "Lista de alunos atrasados").',
        '- Sem aspas, sem ponto final, sem prefixos como "Título:".',
        '- Se a mensagem for vazia ou genérica, devolva "Nova conversa".',
      ].join('\n'),
      prompt: `Mensagem do usuário:\n"""${firstMessage}"""\n\nTítulo:`,
    })
    // Defensive cap in case the model ignores the contract — better an awkward
    // truncation than a 200-char refusal pasted into the sidebar.
    const cleaned =
      text
        .trim()
        .replace(/^["']|["']$/g, '')
        .slice(0, 60) || 'Nova conversa'
    await AiThread.query().where('id', threadId).update({ title: cleaned })

    if (usage) {
      await AiTokenUsage.create({
        threadId,
        messageId: null,
        userId: req.userId,
        schoolId: req.schoolId,
        model: titleModel,
        purpose: 'title',
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
        totalTokens: usage.totalTokens ?? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
      })
    }
  }
}
