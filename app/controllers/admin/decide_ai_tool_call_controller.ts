import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AiToolCall from '#models/ai_tool_call'
import AiThread from '#models/ai_thread'
import { dispatchAction } from '#ai/action_dispatcher'
import { decideAiToolCallValidator } from '#validators/ai'

export default class DecideAiToolCallController {
  async handle({ params, request, response, auth, effectiveUser }: HttpContext) {
    const toolCallId = String(params.id)
    const { decision } = await request.validateUsing(decideAiToolCallValidator)
    const user = effectiveUser ?? auth.user!

    const toolCall = await AiToolCall.find(toolCallId)
    if (!toolCall) {
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
      return response.ok({ id: toolCall.id, status: toolCall.status })
    }

    // approve: dispatch da ação
    const thread = await AiThread.find(toolCall.threadId)
    const result = await dispatchAction({
      toolCallId: toolCall.id,
      toolName: toolCall.toolName,
      input: toolCall.input,
      threadId: toolCall.threadId,
      schoolId: thread?.schoolId ?? toolCall.schoolId,
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
    await toolCall.save()

    return response.ok({
      id: toolCall.id,
      status: toolCall.status,
      output: toolCall.output,
      error: toolCall.error,
    })
  }
}
