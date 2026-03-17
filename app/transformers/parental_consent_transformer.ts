import { BaseTransformer } from '@adonisjs/core/transformers'
import type EventParentalConsent from '#models/event_parental_consent'

export default class ParentalConsentTransformer extends BaseTransformer<EventParentalConsent> {
  toObject() {
    const event = this.resource.event
    const student = this.resource.student

    return {
      ...this.pick(this.resource, [
        'id',
        'eventId',
        'studentId',
        'status',
        'createdAt',
        'expiresAt',
      ]),
      event: {
        id: event?.id ?? '',
        title: event?.title ?? '',
        description: event?.description,
        location: event?.location,
        type: event?.type ?? 'CUSTOM',
        startDate: event?.startDate,
        endDate: event?.endDate,
        requiresParentalConsent: event?.requiresParentalConsent ?? false,
        school: {
          id: event?.school?.id ?? '',
          name: event?.school?.name ?? '',
        },
      },
      student: {
        id: student?.id ?? '',
        name: student?.user?.name ?? '',
      },
    }
  }
}
