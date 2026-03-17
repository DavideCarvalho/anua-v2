import { BaseTransformer } from '@adonisjs/core/transformers'
import type EventParentalConsent from '#models/event_parental_consent'

export default class EventParentalConsentTransformer extends BaseTransformer<EventParentalConsent> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'eventId',
      'studentId',
      'responsibleId',
      'status',
      'respondedAt',
      'expiresAt',
      'approvalNotes',
      'denialReason',
      'signature',
      'ipAddress',
      'emailSentAt',
      'reminderSentAt',
      'reminderCount',
      'metadata',
      'createdAt',
      'updatedAt',
    ])
  }
}
