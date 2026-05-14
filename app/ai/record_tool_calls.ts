import AiToolCall, { type AiToolKind } from '#models/ai_tool_call'
import type { StoredToolCall, StoredToolResult } from '#models/ai_thread_message'
import logger from '@adonisjs/core/services/logger'

/**
 * Conjunto de tools que precisam de aprovação humana antes de executar
 * (kind = 'action'). Por enquanto vazio — todas as tools existentes são
 * de leitura. Quando adicionarmos tools de escrita (enviarComunicado,
 * cancelarBoleto, etc), o nome entra aqui e o flow de approval kicks in.
 */
export const WRITE_TOOL_NAMES: ReadonlySet<string> = new Set<string>()

export function toolKindFromName(name: string): AiToolKind {
  return WRITE_TOOL_NAMES.has(name) ? 'action' : 'read'
}

export type RecordToolCallsArgs = {
  threadId: string
  messageId: string | null
  userId: string
  schoolId: string | null
  toolCalls: StoredToolCall[]
  toolResults: StoredToolResult[]
}

/**
 * Persiste um row por tool call no audit log. Read tools entram como
 * 'auto_executed'; action tools (não temos ainda) entrarão como
 * 'pending_approval' até serem decididas. Pareia cada call com seu result
 * por toolCallId — sem result indica que a chain abortou antes desse step
 * completar.
 *
 * Falha não propaga: auditoria é observabilidade, não correção. Se gravar
 * der erro, log e segue.
 */
export async function recordToolCalls(args: RecordToolCallsArgs): Promise<void> {
  if (args.toolCalls.length === 0) return

  try {
    const resultsByCall = new Map<string, StoredToolResult>()
    for (const r of args.toolResults) {
      resultsByCall.set(r.toolCallId, r)
    }

    for (const call of args.toolCalls) {
      const result = resultsByCall.get(call.toolCallId)
      const kind = toolKindFromName(call.toolName)
      const hasResult = result !== undefined
      const output = result?.output
      // Heurística: result.output com a forma { error: '...' } indica que a
      // tool falhou em validação interna (ex: scope check denied). Trata
      // como FAILED no audit pra ficar fácil de filtrar.
      const looksLikeError =
        output && typeof output === 'object' && 'error' in (output as Record<string, unknown>)

      let status: AiToolCall['status']
      if (kind === 'action' && !hasResult) status = 'pending_approval'
      else if (looksLikeError) status = 'failed'
      else if (hasResult) status = 'auto_executed'
      else status = 'failed' // call sem result em read tool = abortado/timeout

      await AiToolCall.create({
        threadId: args.threadId,
        messageId: args.messageId,
        userId: args.userId,
        schoolId: args.schoolId,
        toolName: call.toolName,
        toolKind: kind,
        status,
        input: call.input ?? null,
        output: output ?? null,
        error: looksLikeError
          ? String((output as Record<string, unknown>).error)
          : null,
        executionMs: null,
      })
    }
  } catch (err) {
    logger.error({ err, threadId: args.threadId }, 'recordToolCalls failed')
  }
}
