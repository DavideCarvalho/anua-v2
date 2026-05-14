import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AiToolCall from '#models/ai_tool_call'
import AiThread from '#models/ai_thread'
import { dispatchAction } from '#ai/action_dispatcher'
import { submitCanvasValidator } from '#validators/ai'

/**
 * Submit do canvas: o usuário preencheu/revisou o form do painel flutuante
 * e clicou em "Criar". Aqui validamos ownership da thread, despachamos a
 * ação real (createAssignment, etc) e gravamos um row de auditoria do tipo
 * 'action' que sai direto pra 'executed'/'failed' (sem pending_approval —
 * o canvas substitui a aprovação inline).
 *
 * O contrato: o frontend manda { threadId, toolName, fields }. O toolName
 * aqui é o nome da AÇÃO canônica (ex: 'createAssignment'), não do canvas
 * opener (prepareCreateAssignment). Quem mapeia uma coisa na outra é o
 * frontend — o backend só conhece o nome final.
 *
 * Whitelist é defensiva: só toolNames com handler em action_dispatcher
 * passam aqui. Sem isso, qualquer um podia chamar /canvas/submit com
 * toolName='sendCommunication' e burlar o fluxo de aprovação.
 */
const CANVAS_SUBMITTABLE_ACTIONS: ReadonlySet<string> = new Set<string>(['createAssignment'])

export default class SubmitCanvasController {
  async handle({ request, response, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user!
    const { threadId, toolName, fields } = await request.validateUsing(submitCanvasValidator)

    if (!CANVAS_SUBMITTABLE_ACTIONS.has(toolName)) {
      return response.badRequest({
        message: `Ação '${toolName}' não pode ser submetida via canvas.`,
      })
    }

    const thread = await AiThread.find(threadId)
    if (!thread || thread.userId !== user.id) {
      return response.notFound({ message: 'Conversa não encontrada' })
    }

    const now = DateTime.now().toSQL()
    // Cria o row de auditoria já como 'executing'. Se o dispatcher falhar,
    // viramos pra 'failed'; se OK, pra 'executed'. Sem 'pending_approval'
    // intermediário — o usuário JÁ aprovou clicando em "Criar".
    const audit = await AiToolCall.create({
      threadId,
      messageId: null,
      userId: user.id,
      schoolId: thread.schoolId,
      toolCallId: null,
      toolName,
      toolKind: 'action',
      status: 'executing',
      input: fields,
      output: null,
      error: null,
      executionMs: null,
      decidedByUserId: user.id,
      decidedAt: DateTime.fromSQL(now),
    })

    const start = Date.now()
    const result = await dispatchAction({
      toolCallId: audit.id,
      toolName,
      input: fields,
      threadId,
      schoolId: thread.schoolId,
      decidedByUserId: user.id,
    })

    audit.status = result.ok ? 'executed' : 'failed'
    audit.output = result.ok ? result.output : null
    audit.error = result.ok ? null : result.error
    audit.executionMs = Date.now() - start
    await audit.save()

    if (!result.ok) {
      return response.unprocessableEntity({
        status: 'failed',
        error: result.error,
      })
    }

    return response.ok({
      status: 'executed',
      output: result.output,
    })
  }
}
