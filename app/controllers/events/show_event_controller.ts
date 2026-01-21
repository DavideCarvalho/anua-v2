import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'

export default class ShowEventController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const event = await Event.query()
      .where('id', id)
      .preload('organizer')
      .preload('school')
      .preload('participants', (query) => {
        query.preload('user')
      })
      .withCount('participants')
      .first()

    if (!event) {
      return response.notFound({ message: 'Event not found' })
    }

    return response.ok(event)
  }
}
