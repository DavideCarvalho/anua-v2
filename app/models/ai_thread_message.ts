import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AiThread from './ai_thread.js'

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

  @column({ columnName: 'toolCalls' })
  declare toolCalls: Record<string, unknown> | null

  @column({ columnName: 'toolResults' })
  declare toolResults: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => AiThread, { foreignKey: 'threadId' })
  declare thread: BelongsTo<typeof AiThread>
}
