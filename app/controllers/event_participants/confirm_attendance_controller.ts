import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventParticipant from '#models/event_participant'
import AppException from '#exceptions/app_exception'

export default class ConfirmAttendanceController {
  async handle({ params, response }: HttpContext) {
    const { eventId, userId } = params

    const event = await Event.find(eventId)

    if (!event) {
      throw AppException.notFound('Evento não encontrado')
    }

    // Can only confirm attendance for published or completed events
    if (event.status !== 'PUBLISHED' && event.status !== 'COMPLETED') {
      throw AppException.badRequest(
        'Só é possível confirmar presença para eventos publicados ou concluídos'
      )
    }

    const participant = await EventParticipant.query()
      .where('eventId', eventId)
      .where('userId', userId)
      .first()

    if (!participant) {
      throw AppException.notFound('Participante não encontrado para este evento')
    }

    participant.status = 'ATTENDED'
    await participant.save()
    await participant.load('user')

    return response.ok(participant)
  }
}
