import AiToolCall, { type AiToolKind } from '#models/ai_tool_call'
import type { StoredToolCall, StoredToolResult } from '#models/ai_thread_message'
import logger from '@adonisjs/core/services/logger'

/**
 * Conjunto de tools que precisam de aprovação humana antes de executar
 * (kind = 'action'). Toda tool aqui DEVE ser definida com defineActionTool
 * (sem execute) e ter um handler correspondente em action_dispatcher.ts.
 */
export const WRITE_TOOL_NAMES: ReadonlySet<string> = new Set<string>([
  'sendCommunication',
  'justifyAbsence',
  'enterExamGrade',
  'registerAttendance',
])

/**
 * Canvas openers: tools que NÃO escrevem nada no banco, só pedem pro
 * frontend abrir um painel flutuante com um form pré-preenchido. O usuário
 * revisa, ajusta o que quiser, e o submit do canvas dispara a action real
 * (ex: prepareCreateAssignment abre o painel; submit chama createAssignment
 * pelo /api/v1/ai/canvas/submit). Audit grava como kind='canvas' /
 * 'auto_executed' — a action real cria seu próprio row.
 */
export const CANVAS_TOOL_NAMES: ReadonlySet<string> = new Set<string>(['prepareCreateAssignment'])

export function toolKindFromName(name: string): AiToolKind {
  if (WRITE_TOOL_NAMES.has(name)) return 'action'
  if (CANVAS_TOOL_NAMES.has(name)) return 'canvas'
  return 'read'
}

export type StoredToolError = {
  toolCallId: string
  toolName: string
  error: string
}

export type RecordToolCallsArgs = {
  threadId: string
  messageId: string | null
  userId: string
  schoolId: string | null
  toolCalls: StoredToolCall[]
  toolResults: StoredToolResult[]
  toolErrors: StoredToolError[]
}

/**
 * Persiste um row por tool call no audit log. Pareia cada call por
 * toolCallId com:
 *   - toolResult emitido pelo execute() → status='auto_executed' (ou
 *     'failed' se o output tem shape { error }, ex: scope check denied)
 *   - tool-error part (SDK v6+ emite quando execute lança exception) →
 *     status='failed' com o error column preenchido
 *   - nem result nem error em read tool → status='failed' (timeout/abort)
 *   - nem result nem error em action tool → status='pending_approval'
 *     (modelo emitiu input-available; aguarda aprovação humana)
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
    const errorsByCall = new Map<string, StoredToolError>()
    for (const e of args.toolErrors) {
      errorsByCall.set(e.toolCallId, e)
    }

    for (const call of args.toolCalls) {
      const result = resultsByCall.get(call.toolCallId)
      const toolError = errorsByCall.get(call.toolCallId)
      const kind = toolKindFromName(call.toolName)
      const hasResult = result !== undefined
      const hasToolError = toolError !== undefined
      const output = result?.output
      // Heurística: result.output com a forma { error: '...' } indica que a
      // tool falhou em validação interna (ex: scope check denied). Trata
      // como FAILED no audit pra ficar fácil de filtrar.
      const looksLikeError =
        output && typeof output === 'object' && 'error' in (output as Record<string, unknown>)

      let status: AiToolCall['status']
      let errorText: string | null = null
      if (hasToolError) {
        status = 'failed'
        errorText = toolError!.error
      } else if (kind === 'action' && !hasResult) {
        status = 'pending_approval'
      } else if (looksLikeError) {
        status = 'failed'
        errorText = String((output as Record<string, unknown>).error)
      } else if (hasResult) {
        status = 'auto_executed'
      } else {
        // read tool sem result nem tool-error: abortado/timeout antes do
        // execute rodar (ex: stream cancelado, ou erro acima da camada da tool).
        status = 'failed'
      }

      await AiToolCall.create({
        threadId: args.threadId,
        messageId: args.messageId,
        userId: args.userId,
        schoolId: args.schoolId,
        toolCallId: call.toolCallId,
        toolName: call.toolName,
        toolKind: kind,
        status,
        input: call.input ?? null,
        output: output ?? null,
        error: errorText,
        executionMs: null,
      })
    }
  } catch (err) {
    logger.error({ err, threadId: args.threadId }, 'recordToolCalls failed')
  }
}
