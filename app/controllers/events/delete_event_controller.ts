import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'

export default class DeleteEventController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const event = await Event.find(id)

    if (!event) {
      return response.notFound({ message: 'Event not found' })
    }

    // Only allow deletion of draft events
    if (event.status !== 'DRAFT') {
      return response.badRequest({
        message: 'Only draft events can be deleted. Cancel the event instead.',
      })
    }

    await event.delete()

    return response.ok({ message: 'Event deleted successfully' })
  }
}
