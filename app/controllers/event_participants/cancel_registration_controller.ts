import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventParticipant from '#models/event_participant'
import AppException from '#exceptions/app_exception'

export default class CancelRegistrationController {
  async handle({ params, response }: HttpContext) {
    const { eventId, participantId } = params

    const event = await Event.find(eventId)

    if (!event) {
      throw AppException.notFound('Evento não encontrado')
    }

    // Don't allow cancellation for completed events
    if (event.status === 'COMPLETED') {
      throw AppException.badRequest('Não é possível cancelar inscrição em eventos concluídos')
    }

    const participant = await EventParticipant.query()
      .where('eventId', eventId)
      .where('participantId', participantId)
      .first()

    if (!participant) {
      throw AppException.notFound('Participante não encontrado para este evento')
    }

    await participant.delete()

    return response.ok({ message: 'Inscrição cancelada com sucesso' })
  }
}
