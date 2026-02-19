import { BaseModelDto } from '@adocasts.com/dto/base'
import type WebhookEvent from '#models/webhook_event'
import type { WebhookProvider, WebhookEventStatus } from '#models/webhook_event'
import type { DateTime } from 'luxon'

export default class WebhookEventDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare provider: WebhookProvider
  declare eventType: string
  declare payload: Record<string, unknown>
  declare status: WebhookEventStatus
  declare processedAt: DateTime | null
  declare error: string | null
  declare attempts: number
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: WebhookEvent) {
    super()

    if (!model) return

    this.id = model.id
    this.eventId = model.eventId
    this.provider = model.provider
    this.eventType = model.eventType
    this.payload = model.payload
    this.status = model.status
    this.processedAt = model.processedAt
    this.error = model.error
    this.attempts = model.attempts
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
