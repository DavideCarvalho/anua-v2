import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AiThread from './ai_thread.js'

export type StoredToolCall = {
  toolCallId: string
  toolName: string
  input?: unknown
  args?: unknown
}

export type StoredToolResult = {
  toolCallId: string
  toolName: string
  output?: unknown
  result?: unknown
}

// JSONB columns need explicit JSON.stringify on the way in. Without prepare,
// Lucid double-stringifies arrays into a quoted JSON-string-of-a-JSON-array
// and PostgreSQL rejects it ("invalid input syntax for type json").
const jsonColumn = {
  prepare: (value: unknown) => (value === null || value === undefined ? value : JSON.stringify(value)),
  consume: (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : value),
}

export default class AiThreadMessage extends BaseModel {
  static table = 'ai_thread_messages'

  @beforeCreate()
  static assignId(model: AiThreadMessage) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'threadId' })
  declare threadId: string

  @column()
  declare role: 'user' | 'assistant' | 'system'

  @column()
  declare content: string

  @column({ columnName: 'toolCalls', ...jsonColumn })
  declare toolCalls: StoredToolCall[] | null

  @column({ columnName: 'toolResults', ...jsonColumn })
  declare toolResults: StoredToolResult[] | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => AiThread, { foreignKey: 'threadId' })
  declare thread: BelongsTo<typeof AiThread>
}
