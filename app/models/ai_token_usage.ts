import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AiThread from './ai_thread.js'
import AiThreadMessage from './ai_thread_message.js'

export type AiTokenUsagePurpose = 'chat' | 'title'

export default class AiTokenUsage extends BaseModel {
  static table = 'ai_token_usages'

  @beforeCreate()
  static assignId(model: AiTokenUsage) {
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
  declare model: string

  @column()
  declare purpose: AiTokenUsagePurpose

  @column({ columnName: 'inputTokens' })
  declare inputTokens: number

  @column({ columnName: 'outputTokens' })
  declare outputTokens: number

  @column({ columnName: 'totalTokens' })
  declare totalTokens: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => AiThread, { foreignKey: 'threadId' })
  declare thread: BelongsTo<typeof AiThread>

  @belongsTo(() => AiThreadMessage, { foreignKey: 'messageId' })
  declare message: BelongsTo<typeof AiThreadMessage>
}
