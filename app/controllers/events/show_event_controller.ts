import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventDto from '#models/dto/event.dto'
import AppException from '#exceptions/app_exception'

export default class ShowEventController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const event = await Event.query()
      .where('id', id)
      .preload('organizer')
      .preload('school')
      .preload('eventAudiences')
      .preload('participants', (query) => {
        query.preload('user')
      })
      .withCount('participants')
      .first()

    if (!event) {
      throw AppException.notFound('Evento não encontrado')
    }

    return response.ok(new EventDto(event))
  }
}
