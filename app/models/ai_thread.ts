import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import AiThreadMessage from './ai_thread_message.js'

export default class AiThread extends BaseModel {
  static table = 'ai_threads'

  @beforeCreate()
  static assignId(model: AiThread) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare title: string | null

  @column()
  declare persona: string | null

  @column({ columnName: 'schoolId' })
  declare schoolId: string | null

  @column()
  declare channel: 'web' | 'whatsapp'

  // Resumo das mensagens mais antigas, gerado quando a thread passa do
  // limite de mensagens. Permite manter contexto sem mandar 100+ msgs
  // pro modelo a cada turno. Quando preenchido, é prepended como mensagem
  // 'system' antes das mensagens recentes em loadThreadHistory.
  @column()
  declare contextSummary: string | null

  // Id da última mensagem incluída no contextSummary. Mensagens criadas
  // depois dessa não estão no resumo — são mandadas cruas pro modelo.
  @column()
  declare summaryUpToMessageId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => AiThreadMessage, { foreignKey: 'threadId' })
  declare messages: HasMany<typeof AiThreadMessage>
}
