import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import { listEventsValidator } from '#validators/event'

export default class ListEventsController {
  async handle({ request, response }: HttpContext) {
    const {
      schoolId,
      type,
      status,
      visibility,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = await request.validateUsing(listEventsValidator)

    const query = Event.query()
      .preload('organizer')
      .preload('school')
      .withCount('participants')

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    if (type) {
      query.where('type', type)
    }

    if (status) {
      query.where('status', status)
    }

    if (visibility) {
      query.where('visibility', visibility)
    }

    if (startDate) {
      query.where('startsAt', '>=', startDate)
    }

    if (endDate) {
      query.where('startsAt', '<=', endDate)
    }

    const events = await query
      .orderBy('startsAt', 'desc')
      .paginate(page, limit)

    return response.ok(events)
  }
}
