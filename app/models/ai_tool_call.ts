import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AiThread from './ai_thread.js'
import AiThreadMessage from './ai_thread_message.js'
import User from './user.js'

export type AiToolKind = 'read' | 'action' | 'canvas'

export type AiToolCallStatus =
  | 'auto_executed'
  | 'pending_approval'
  // Estado transiente — a aprovação ganhou o CAS e a action está rodando no
  // dispatcher. Bloqueia aprovações concorrentes (mesmo user em 2 devices,
  // duplo-clique, etc). Termina em 'executed' ou 'failed'.
  | 'executing'
  | 'executed'
  | 'rejected'
  | 'failed'

// Lucid double-stringifica JSONB se a gente entregar o objeto cru — segue o
// mesmo padrão do AiThreadMessage com prepare/consume manuais.
const jsonColumn = {
  prepare: (value: unknown) =>
    value === null || value === undefined ? value : JSON.stringify(value),
  consume: (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : value),
}

export default class AiToolCall extends BaseModel {
  static table = 'ai_tool_calls'

  @beforeCreate()
  static assignId(model: AiToolCall) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'threadId' })
  declare threadId: string

  @column({ columnName: 'messageId' })
  declare messageId: string | null

  @column({ columnName: 'userId' })
  declare userId: string

  @column({ columnName: 'schoolId' })
  declare schoolId: string | null

  // Identificador da call vindo do Vercel AI SDK (parte `tool-*` no UIMessage).
  // É o que o frontend usa pra chamar /api/v1/ai/tool-calls/:toolCallId/decide
  // a partir do próprio chat.
  @column({ columnName: 'toolCallId' })
  declare toolCallId: string | null

  @column({ columnName: 'toolName' })
  declare toolName: string

  @column({ columnName: 'toolKind' })
  declare toolKind: AiToolKind

  @column({ columnName: 'status' })
  declare status: AiToolCallStatus

  @column({ columnName: 'input', ...jsonColumn })
  declare input: unknown

  @column({ columnName: 'output', ...jsonColumn })
  declare output: unknown

  @column({ columnName: 'error' })
  declare error: string | null

  @column({ columnName: 'executionMs' })
  declare executionMs: number | null

  @column({ columnName: 'decidedByUserId' })
  declare decidedByUserId: string | null

  @column.dateTime({ columnName: 'decidedAt' })
  declare decidedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @belongsTo(() => AiThread, { foreignKey: 'threadId' })
  declare thread: BelongsTo<typeof AiThread>

  @belongsTo(() => AiThreadMessage, { foreignKey: 'messageId' })
  declare message: BelongsTo<typeof AiThreadMessage>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'decidedByUserId' })
  declare decidedBy: BelongsTo<typeof User>
}
