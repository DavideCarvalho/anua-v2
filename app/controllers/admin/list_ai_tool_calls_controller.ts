import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import AiToolCall from '#models/ai_tool_call'

const queryValidator = vine.compile(
  vine.object({
    limit: vine.number().min(1).max(200).optional(),
    offset: vine.number().min(0).optional(),
    status: vine
      .string()
      .in(['auto_executed', 'pending_approval', 'executing', 'executed', 'rejected', 'failed'])
      .optional(),
    toolName: vine.string().optional(),
    toolKind: vine.string().in(['read', 'action']).optional(),
    // userId: pega tudo que um user fez. userQ: substring no nome do user.
    userId: vine.string().uuid().optional(),
    userQ: vine.string().minLength(2).optional(),
    schoolId: vine.string().uuid().optional(),
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
    const {
      limit = 50,
      offset = 0,
      status,
      toolName,
      toolKind,
      userId,
      userQ,
      schoolId,
    } = await request.validateUsing(queryValidator)

    // Subquery de userIds quando filtra por nome (case-insensitive substring).
    // Resolvemos uma vez e usamos como IN nas duas queries (lista + count).
    let userIdsByName: string[] | null = null
    if (userQ) {
      const users = await db
        .from('User')
        .select('id')
        .whereILike('name', `%${userQ}%`)
        .whereNull('deletedAt')
        .limit(200)
      userIdsByName = users.map((u) => String(u.id))
      if (userIdsByName.length === 0) {
        // Nenhum user bate — não tem como ter audit row.
        return response.ok({ rows: [], total: 0, limit, offset })
      }
    }

    const listQuery = AiToolCall.query()
      .preload('user')
      .preload('thread')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
    const countQuery = AiToolCall.query()

    for (const q of [listQuery, countQuery]) {
      if (status) q.where('status', status)
      if (toolName) q.where('toolName', toolName)
      if (toolKind) q.where('toolKind', toolKind)
      if (userId) q.where('userId', userId)
      if (schoolId) q.where('schoolId', schoolId)
      if (userIdsByName) q.whereIn('userId', userIdsByName)
    }

    const [rows, totalResult] = await Promise.all([
      listQuery.exec(),
      countQuery.count('* as total').first(),
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
      user: r.user ? { id: r.user.id, name: r.user.name ?? null } : null,
      thread: r.thread
        ? { id: r.thread.id, title: r.thread.title, channel: r.thread.channel }
        : null,
      message: r.messageId ? { id: r.messageId } : null,
    }))

    return response.ok({ rows: serialized, total, limit, offset })
  }
}
