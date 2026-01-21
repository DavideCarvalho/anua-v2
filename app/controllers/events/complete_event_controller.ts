import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'

export default class CompleteEventController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const event = await Event.find(id)

    if (!event) {
      return response.notFound({ message: 'Event not found' })
    }

    if (event.status !== 'PUBLISHED') {
      return response.badRequest({
        message: `Cannot complete event with status '${event.status}'. Only published events can be completed.`,
      })
    }

    event.status = 'COMPLETED'
    await event.save()

    await event.load('organizer')
    await event.load('school')

    return response.ok(event)
  }
}
