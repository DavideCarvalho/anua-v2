import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventParticipant from '#models/event_participant'
import { updateParticipantStatusValidator } from '#validators/event'

export default class UpdateParticipantStatusController {
  async handle({ params, request, response }: HttpContext) {
    const { eventId, userId } = params
    const data = await request.validateUsing(updateParticipantStatusValidator)

    const event = await Event.find(eventId)

    if (!event) {
      return response.notFound({ message: 'Event not found' })
    }

    const participant = await EventParticipant.query()
      .where('eventId', eventId)
      .where('userId', userId)
      .first()

    if (!participant) {
      return response.notFound({ message: 'Participant not found for this event' })
    }

    participant.status = data.status
    // Validator doesn't provide notes, removed the update

    await participant.save()
    await participant.load('user')

    return response.ok(participant)
  }
}
