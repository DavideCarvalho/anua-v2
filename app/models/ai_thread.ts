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

  // PrismaNamingStrategy é setado em start/orm.ts mas roda DEPOIS dos
  // models serem carregados (preload order: routes → kernel → orm). Por
  // isso TODA coluna camelCase precisa de `columnName` explícito — sem
  // isso o SnakeCaseNamingStrategy default mapeia userId → user_id e o
  // SELECT explode com "column does not exist".
  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'userId' })
  declare userId: string

  @column({ columnName: 'title' })
  declare title: string | null

  @column({ columnName: 'persona' })
  declare persona: string | null

  @column({ columnName: 'schoolId' })
  declare schoolId: string | null

  @column({ columnName: 'channel' })
  declare channel: 'web' | 'whatsapp'

  @column({ columnName: 'surface' })
  declare surface: 'page' | 'sheet'

  // Resumo das mensagens mais antigas, gerado quando a thread passa do
  // limite de mensagens. Permite manter contexto sem mandar 100+ msgs
  // pro modelo a cada turno. Quando preenchido, é prepended como mensagem
  // 'system' antes das mensagens recentes em loadThreadHistory.
  @column({ columnName: 'contextSummary' })
  declare contextSummary: string | null

  // Id da última mensagem incluída no contextSummary. Mensagens criadas
  // depois dessa não estão no resumo — são mandadas cruas pro modelo.
  @column({ columnName: 'summaryUpToMessageId' })
  declare summaryUpToMessageId: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @hasMany(() => AiThreadMessage, { foreignKey: 'threadId' })
  declare messages: HasMany<typeof AiThreadMessage>
}
