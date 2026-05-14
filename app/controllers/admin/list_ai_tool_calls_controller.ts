import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import AiToolCall from '#models/ai_tool_call'

const queryValidator = vine.compile(
  vine.object({
    limit: vine.number().min(1).max(200).optional(),
    offset: vine.number().min(0).optional(),
    status: vine
      .string()
      .in(['auto_executed', 'pending_approval', 'executed', 'rejected', 'failed'])
      .optional(),
    toolName: vine.string().optional(),
    toolKind: vine.string().in(['read', 'action']).optional(),
  })
)

type AuditRow = {
  id: string
  toolName: string
  toolKind: string
  status: string
  input: unknown
  output: unknown
  error: string | null
  executionMs: number | null
  createdAt: string
  user: { id: string; name: string | null } | null
  thread: { id: string; title: string | null; channel: string } | null
  message: { id: string } | null
}

export default class ListAiToolCallsController {
  async handle({ request, response }: HttpContext) {
    const { limit = 50, offset = 0, status, toolName, toolKind } = await request.validateUsing(
      queryValidator
    )

    const query = AiToolCall.query()
      .preload('user')
      .preload('thread')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)

    if (status) query.where('status', status)
    if (toolName) query.where('toolName', toolName)
    if (toolKind) query.where('toolKind', toolKind)

    const [rows, totalResult] = await Promise.all([
      query.exec(),
      AiToolCall.query()
        .if(status, (q) => q.where('status', status!))
        .if(toolName, (q) => q.where('toolName', toolName!))
        .if(toolKind, (q) => q.where('toolKind', toolKind!))
        .count('* as total')
        .first(),
    ])

    const total = Number(totalResult?.$extras?.total ?? 0)

    const serialized: AuditRow[] = rows.map((r) => ({
      id: r.id,
      toolName: r.toolName,
      toolKind: r.toolKind,
      status: r.status,
      input: r.input,
      output: r.output,
      error: r.error,
      executionMs: r.executionMs,
      createdAt: r.createdAt.toISO() ?? '',
      user: r.user
        ? { id: r.user.id, name: r.user.name ?? null }
        : null,
      thread: r.thread
        ? { id: r.thread.id, title: r.thread.title, channel: r.thread.channel }
        : null,
      message: r.messageId ? { id: r.messageId } : null,
    }))

    return response.ok({ rows: serialized, total, limit, offset })
  }
}
