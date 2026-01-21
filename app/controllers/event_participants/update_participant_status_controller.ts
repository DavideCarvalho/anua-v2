import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventParticipant from '#models/event_participant'
import { updateParticipantStatusValidator } from '#validators/event'
import { DateTime } from 'luxon'

export default class UpdateParticipantStatusController {
  async handle({ params, request, response }: HttpContext) {
    const { eventId, participantId } = params
    const data = await request.validateUsing(updateParticipantStatusValidator)

    const event = await Event.find(eventId)

    if (!event) {
      return response.notFound({ message: 'Event not found' })
    }

    const participant = await EventParticipant.query()
      .where('eventId', eventId)
      .where('participantId', participantId)
      .first()

    if (!participant) {
      return response.notFound({ message: 'Participant not found for this event' })
    }

    participant.status = data.status

    // Track parental consent
    if (data.parentalConsent !== undefined) {
      participant.parentalConsent = data.parentalConsent
      if (data.parentalConsent) {
        participant.parentalConsentGivenAt = DateTime.now()
      }
    }

    await participant.save()
    await participant.load('participant')

    return response.ok(participant)
  }
}
