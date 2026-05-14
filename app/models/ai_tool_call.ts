import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AiThread from './ai_thread.js'
import AiThreadMessage from './ai_thread_message.js'
import User from './user.js'

export type AiToolKind = 'read' | 'action'

export type AiToolCallStatus =
  | 'auto_executed'
  | 'pending_approval'
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

  @column()
  declare toolName: string

  @column()
  declare toolKind: AiToolKind

  @column()
  declare status: AiToolCallStatus

  @column({ ...jsonColumn })
  declare input: unknown

  @column({ ...jsonColumn })
  declare output: unknown

  @column()
  declare error: string | null

  @column({ columnName: 'executionMs' })
  declare executionMs: number | null

  @column({ columnName: 'decidedByUserId' })
  declare decidedByUserId: string | null

  @column.dateTime({ columnName: 'decidedAt' })
  declare decidedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
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
