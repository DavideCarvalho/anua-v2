import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
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
 *
 * Concorrência: usa CAS atômico — UPDATE WHERE status='pending_approval'
 * flipa pra 'executing' (approve) ou direto pra 'rejected' (reject). Se
 * outra requisição (mesmo user em 2 devices, duplo-clique, etc) ganhou
 * primeiro, o UPDATE devolve 0 rows e retornamos 409. Sem race possível.
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

    const now = DateTime.now().toSQL()

    if (decision === 'reject') {
      // CAS: só rejeita se ainda está em pending_approval. .returning('id')
      // devolve array dos rows que bateram no WHERE — length 0 = perdemos
      // a corrida pra outro request.
      const claimed = await db
        .from('ai_tool_calls')
        .where('id', toolCall.id)
        .where('status', 'pending_approval')
        .update(
          {
            status: 'rejected',
            decidedByUserId: user.id,
            decidedAt: now,
          },
          ['id']
        )
      if (claimed.length === 0) {
        const fresh = await AiToolCall.find(toolCall.id)
        return response.conflict({
          message: `Esta chamada já foi decidida (${fresh?.status ?? toolCall.status})`,
        })
      }
      return response.ok({
        id: toolCall.id,
        toolCallId: toolCall.toolCallId,
        status: 'rejected',
        output: { cancelled: true, reason: 'user declined' },
      })
    }

    // approve: primeiro ganha o lock CAS flipando pra 'executing'.
    const claimed = await db
      .from('ai_tool_calls')
      .where('id', toolCall.id)
      .where('status', 'pending_approval')
      .update(
        {
          status: 'executing',
          decidedByUserId: user.id,
          decidedAt: now,
        },
        ['id']
      )
    if (claimed.length === 0) {
      const fresh = await AiToolCall.find(toolCall.id)
      return response.conflict({
        message: `Esta chamada já foi decidida (${fresh?.status ?? toolCall.status})`,
      })
    }

    // A partir daqui somos donos exclusivos da execução. Concorrentes que
    // chegarem agora veem status='executing' e ganham 409.
    const start = Date.now()
    const result = await dispatchAction({
      toolCallId: toolCall.id,
      toolName: toolCall.toolName,
      input: toolCall.input,
      threadId: toolCall.threadId,
      schoolId: thread.schoolId ?? toolCall.schoolId,
      decidedByUserId: user.id,
    })

    const finalStatus = result.ok ? 'executed' : 'failed'
    await db
      .from('ai_tool_calls')
      .where('id', toolCall.id)
      .update({
        status: finalStatus,
        output: result.ok ? JSON.stringify(result.output) : null,
        error: result.ok ? null : result.error,
        executionMs: Date.now() - start,
      })

    return response.ok({
      id: toolCall.id,
      toolCallId: toolCall.toolCallId,
      status: finalStatus,
      output: result.ok ? result.output : { error: result.error },
      error: result.ok ? null : result.error,
    })
  }
}
