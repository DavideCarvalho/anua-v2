import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Event from '#models/event'
import EventParticipant from '#models/event_participant'
import { registerParticipantValidator } from '#validators/event'
import { randomUUID } from 'node:crypto'

export default class RegisterParticipantController {
  async handle({ params, request, response }: HttpContext) {
    const { eventId } = params
    const data = await request.validateUsing(registerParticipantValidator)

    const event = await Event.query().where('id', eventId).withCount('participants').first()

    if (!event) {
      return response.notFound({ message: 'Event not found' })
    }

    // Check if event is published
    if (event.status !== 'PUBLISHED') {
      return response.badRequest({ message: 'Can only register for published events' })
    }

    // Check if event has capacity
    if (event.maxParticipants && event.$extras.participants_count >= event.maxParticipants) {
      return response.badRequest({ message: 'Event is at full capacity' })
    }

    // Check if user is already registered
    // Validator provides participantId, model expects userId
    const existingParticipant = await EventParticipant.query()
      .where('eventId', eventId)
      .where('userId', data.participantId)
      .first()

    if (existingParticipant) {
      return response.badRequest({ message: 'User is already registered for this event' })
    }

    const participant = await EventParticipant.create({
      id: randomUUID(),
      eventId,
      userId: data.participantId, // Map participantId to userId
      status: 'CONFIRMED',
      registrationDate: DateTime.now(),
    })

    await participant.load('user')
    await participant.load('event')

    return response.created(participant)
  }
}
