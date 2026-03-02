import { BaseTransformer } from '@adonisjs/core/transformers'
import type Event from '#models/event'
import UserTransformer from '#transformers/user_transformer'
import SchoolTransformer from '#transformers/school_transformer'
import EventParticipantTransformer from '#transformers/event_participant_transformer'

export default class EventTransformer extends BaseTransformer<Event> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'title',
        'description',
        'shortDescription',
        'type',
        'status',
        'visibility',
        'priority',
        'startDate',
        'endDate',
        'startTime',
        'endTime',
        'isAllDay',
        'location',
        'locationDetails',
        'isOnline',
        'onlineUrl',
        'isExternal',
        'organizerId',
        'maxParticipants',
        'currentParticipants',
        'requiresRegistration',
        'registrationDeadline',
        'requiresParentalConsent',
        'hasAdditionalCosts',
        'additionalCostAmount',
        'additionalCostInstallments',
        'additionalCostDescription',
        'allowComments',
        'sendNotifications',
        'isRecurring',
        'recurringPattern',
        'bannerUrl',
        'attachments',
        'tags',
        'metadata',
        'schoolId',
        'createdBy',
        'createdAt',
        'updatedAt',
      ]),
      organizer: UserTransformer.transform(this.whenLoaded(this.resource.organizer)),
      creator: UserTransformer.transform(this.whenLoaded(this.resource.creator)),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      participants: EventParticipantTransformer.transform(
        this.whenLoaded(this.resource.participants)
      ),
    }
  }
}
