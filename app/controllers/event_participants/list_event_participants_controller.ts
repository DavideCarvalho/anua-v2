import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventParticipant from '#models/event_participant'
import EventParticipantTransformer from '#transformers/event_participant_transformer'
import { listParticipantsValidator } from '#validators/event'
import AppException from '#exceptions/app_exception'

export default class ListEventParticipantsController {
  async handle({ params, request, serialize }: HttpContext) {
    const { eventId } = params
    const { status, page = 1, limit = 50 } = await request.validateUsing(listParticipantsValidator)

    const event = await Event.find(eventId)

    if (!event) {
      throw AppException.notFound('Evento não encontrado')
    }

    const query = EventParticipant.query().where('eventId', eventId).preload('user')

    if (status) {
      query.where('status', status)
    }

    const participants = await query.orderBy('createdAt', 'desc').paginate(page, limit)

    const data = participants.all()
    const metadata = participants.getMeta()

    return serialize(EventParticipantTransformer.paginate(data, metadata))
  }
}
