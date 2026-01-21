import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventParticipant from '#models/event_participant'
import { listParticipantsValidator } from '#validators/event'

export default class ListEventParticipantsController {
  async handle({ params, request, response }: HttpContext) {
    const { eventId } = params
    const { status, page = 1, limit = 50 } = await request.validateUsing(listParticipantsValidator)

    const event = await Event.find(eventId)

    if (!event) {
      return response.notFound({ message: 'Event not found' })
    }

    const query = EventParticipant.query()
      .where('eventId', eventId)
      .preload('participant')

    if (status) {
      query.where('status', status)
    }

    const participants = await query
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(participants)
  }
}
