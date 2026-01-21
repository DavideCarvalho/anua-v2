import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventParticipant from '#models/event_participant'

export default class CancelRegistrationController {
  async handle({ params, response }: HttpContext) {
    const { eventId, participantId } = params

    const event = await Event.find(eventId)

    if (!event) {
      return response.notFound({ message: 'Event not found' })
    }

    // Don't allow cancellation for completed events
    if (event.status === 'COMPLETED') {
      return response.badRequest({ message: 'Cannot cancel registration for completed events' })
    }

    const participant = await EventParticipant.query()
      .where('eventId', eventId)
      .where('participantId', participantId)
      .first()

    if (!participant) {
      return response.notFound({ message: 'Participant not found for this event' })
    }

    await participant.delete()

    return response.ok({ message: 'Registration cancelled successfully' })
  }
}
