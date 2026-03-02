import { BaseTransformer } from '@adonisjs/core/transformers'
import type EventParticipant from '#models/event_participant'
import UserTransformer from '#transformers/user_transformer'
import EventTransformer from '#transformers/event_transformer'

export default class EventParticipantTransformer extends BaseTransformer<EventParticipant> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'eventId',
        'userId',
        'registrationDate',
        'status',
        'notes',
        'createdAt',
        'updatedAt',
      ]),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user)),
      event: EventTransformer.transform(this.whenLoaded(this.resource.event)),
    }
  }
}
