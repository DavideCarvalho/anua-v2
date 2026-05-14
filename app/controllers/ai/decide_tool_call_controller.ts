import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AiToolCall from '#models/ai_tool_call'
import AiThread from '#models/ai_thread'
import { dispatchAction } from '#ai/action_dispatcher'
import { decideAiToolCallValidator } from '#validators/ai'

/**
 * Decide se uma action tool emitida pelo modelo deve executar. Endpoint
 * user-side: quem aprova é o próprio dono da thread, dentro do chat. O
 * /admin/ai/auditoria é só observação. A regra é análoga ao "Confirm/Cancel"
 * do flip-frontend.
 *
 * O :toolCallId aqui é o identificador do Vercel AI SDK (não a PK do row de
 * auditoria), porque é isso que a UIMessage tem na mão. A ownership check
 * usa o threadId da row.
 */
export default class DecideToolCallController {
  async handle({ params, request, response, auth, effectiveUser }: HttpContext) {
    const toolCallId = String(params.toolCallId)
    const { decision } = await request.validateUsing(decideAiToolCallValidator)
    const user = effectiveUser ?? auth.user!

    const toolCall = await AiToolCall.findBy('toolCallId', toolCallId)
    if (!toolCall) {
      return response.notFound({ message: 'Chamada não encontrada' })
    }

    const thread = await AiThread.find(toolCall.threadId)
    if (!thread || thread.userId !== user.id) {
      return response.notFound({ message: 'Chamada não encontrada' })
    }

    if (toolCall.toolKind !== 'action') {
      return response.badRequest({
        message: 'Apenas tools de escrita podem ser aprovadas/rejeitadas',
      })
    }
    if (toolCall.status !== 'pending_approval') {
      return response.badRequest({
        message: `Esta chamada já foi decidida (${toolCall.status})`,
      })
    }

    if (decision === 'reject') {
      toolCall.status = 'rejected'
      toolCall.decidedByUserId = user.id
      toolCall.decidedAt = DateTime.now()
      await toolCall.save()
      return response.ok({
        id: toolCall.id,
        toolCallId: toolCall.toolCallId,
        status: toolCall.status,
        output: { cancelled: true, reason: 'user declined' },
      })
    }

    const start = Date.now()
    const result = await dispatchAction({
      toolCallId: toolCall.id,
      toolName: toolCall.toolName,
      input: toolCall.input,
      threadId: toolCall.threadId,
      schoolId: thread.schoolId ?? toolCall.schoolId,
      decidedByUserId: user.id,
    })

    if (result.ok) {
      toolCall.status = 'executed'
      toolCall.output = result.output
      toolCall.error = null
    } else {
      toolCall.status = 'failed'
      toolCall.error = result.error
    }
    toolCall.decidedByUserId = user.id
    toolCall.decidedAt = DateTime.now()
    toolCall.executionMs = Date.now() - start
    await toolCall.save()

    return response.ok({
      id: toolCall.id,
      toolCallId: toolCall.toolCallId,
      status: toolCall.status,
      output: toolCall.output ?? (result.ok ? null : { error: toolCall.error }),
      error: toolCall.error,
    })
  }
}
