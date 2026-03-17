import { BaseTransformer } from '@adonisjs/core/transformers'
import type WebhookEvent from '#models/webhook_event'

export default class WebhookEventTransformer extends BaseTransformer<WebhookEvent> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'eventId',
      'provider',
      'eventType',
      'payload',
      'status',
      'processedAt',
      'error',
      'attempts',
      'createdAt',
      'updatedAt',
    ])
  }
}
