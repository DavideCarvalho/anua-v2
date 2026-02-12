import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventParticipant from '#models/event_participant'
import { updateParticipantStatusValidator } from '#validators/event'
import AppException from '#exceptions/app_exception'

export default class UpdateParticipantStatusController {
  async handle({ params, request, response }: HttpContext) {
    const { eventId, userId } = params
    const data = await request.validateUsing(updateParticipantStatusValidator)

    const event = await Event.find(eventId)

    if (!event) {
      throw AppException.notFound('Evento não encontrado')
    }

    const participant = await EventParticipant.query()
      .where('eventId', eventId)
      .where('userId', userId)
      .first()

    if (!participant) {
      throw AppException.notFound('Participante não encontrado para este evento')
    }

    participant.status = data.status
    // Validator doesn't provide notes, removed the update

    await participant.save()
    await participant.load('user')

    return response.ok(participant)
  }
}
