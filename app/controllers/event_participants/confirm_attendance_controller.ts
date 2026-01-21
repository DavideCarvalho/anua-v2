import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventParticipant from '#models/event_participant'

export default class ConfirmAttendanceController {
  async handle({ params, response }: HttpContext) {
    const { eventId, participantId } = params

    const event = await Event.find(eventId)

    if (!event) {
      return response.notFound({ message: 'Event not found' })
    }

    // Can only confirm attendance for published or completed events
    if (event.status !== 'PUBLISHED' && event.status !== 'COMPLETED') {
      return response.badRequest({
        message: 'Can only confirm attendance for published or completed events',
      })
    }

    const participant = await EventParticipant.query()
      .where('eventId', eventId)
      .where('participantId', participantId)
      .first()

    if (!participant) {
      return response.notFound({ message: 'Participant not found for this event' })
    }

    participant.status = 'ATTENDED'
    await participant.save()
    await participant.load('participant')

    return response.ok(participant)
  }
}
