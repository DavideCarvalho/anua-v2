import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, beforeCreate } from '@adonisjs/lucid/orm'

export type WebhookProvider = 'ASAAS' | 'ASAAS_RECARGA' | 'DOCUSEAL'
export type WebhookEventStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export default class WebhookEvent extends BaseModel {
  static table = 'WebhookEvent'

  @beforeCreate()
  static assignId(model: WebhookEvent) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'eventId' })
  declare eventId: string

  @column({ columnName: 'provider' })
  declare provider: WebhookProvider

  @column({ columnName: 'eventType' })
  declare eventType: string

  @column({ columnName: 'payload' })
  declare payload: Record<string, unknown>

  @column({ columnName: 'status' })
  declare status: WebhookEventStatus

  @column.dateTime({ columnName: 'processedAt' })
  declare processedAt: DateTime | null

  @column({ columnName: 'error' })
  declare error: string | null

  @column({ columnName: 'attempts' })
  declare attempts: number

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime
}
