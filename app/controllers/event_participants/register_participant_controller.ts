import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Event from '#models/event'
import EventParticipant from '#models/event_participant'
import { registerParticipantValidator } from '#validators/event'
import { randomUUID } from 'node:crypto'
import AppException from '#exceptions/app_exception'

export default class RegisterParticipantController {
  async handle({ params, request, response }: HttpContext) {
    const { eventId } = params
    const data = await request.validateUsing(registerParticipantValidator)

    const event = await Event.query().where('id', eventId).withCount('participants').first()

    if (!event) {
      throw AppException.notFound('Evento não encontrado')
    }

    // Check if event is published
    if (event.status !== 'PUBLISHED') {
      throw AppException.badRequest('Só é possível registrar participantes em eventos publicados')
    }

    // Check if event has capacity
    if (event.maxParticipants && event.$extras.participants_count >= event.maxParticipants) {
      throw AppException.badRequest('O evento atingiu a capacidade máxima')
    }

    // Check if user is already registered
    // Validator provides participantId, model expects userId
    const existingParticipant = await EventParticipant.query()
      .where('eventId', eventId)
      .where('userId', data.participantId)
      .first()

    if (existingParticipant) {
      throw AppException.operationFailedWithProvidedData(409)
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
