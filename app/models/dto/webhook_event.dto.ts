import { BaseModelDto } from '@adocasts.com/dto/base'
import type WebhookEvent from '#models/webhook_event'
import type { WebhookProvider, WebhookEventStatus } from '#models/webhook_event'

export default class WebhookEventDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare provider: WebhookProvider
  declare eventType: string
  declare payload: Record<string, unknown>
  declare status: WebhookEventStatus
  declare processedAt: Date | null
  declare error: string | null
  declare attempts: number
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: WebhookEvent) {
    super()

    if (!model) return

    this.id = model.id
    this.eventId = model.eventId
    this.provider = model.provider
    this.eventType = model.eventType
    this.payload = model.payload
    this.status = model.status
    this.processedAt = model.processedAt ? model.processedAt.toJSDate() : null
    this.error = model.error
    this.attempts = model.attempts
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
