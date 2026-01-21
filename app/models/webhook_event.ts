import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, beforeCreate } from '@adonisjs/lucid/orm'

export type WebhookProvider = 'STRIPE' | 'ASAAS' | 'PIX' | 'OTHER'
export type WebhookEventStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export default class WebhookEvent extends BaseModel {
  static table = 'WebhookEvent'

  @beforeCreate()
  static assignId(model: WebhookEvent) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare eventId: string

  @column()
  declare provider: WebhookProvider

  @column()
  declare eventType: string

  @column()
  declare payload: Record<string, unknown>

  @column()
  declare status: WebhookEventStatus

  @column.dateTime()
  declare processedAt: DateTime | null

  @column()
  declare error: string | null

  @column()
  declare attempts: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
