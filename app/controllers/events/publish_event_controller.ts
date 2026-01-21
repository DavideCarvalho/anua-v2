import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'

export default class PublishEventController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const event = await Event.find(id)

    if (!event) {
      return response.notFound({ message: 'Event not found' })
    }

    if (event.status !== 'DRAFT') {
      return response.badRequest({
        message: `Cannot publish event with status '${event.status}'. Only draft events can be published.`,
      })
    }

    event.status = 'PUBLISHED'
    await event.save()

    await event.load('organizer')
    await event.load('school')

    return response.ok(event)
  }
}
