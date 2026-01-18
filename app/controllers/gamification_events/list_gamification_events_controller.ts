import type { HttpContext } from '@adonisjs/core/http'
import GamificationEvent from '#models/gamification_event'
import { listGamificationEventsValidator } from '#validators/gamification'

export default class ListGamificationEventsController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(listGamificationEventsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const query = GamificationEvent.query()

    if (payload.studentId) {
      query.where('studentId', payload.studentId)
    }

    if (payload.type) {
      query.where('eventType', payload.type)
    }

    if (payload.status) {
      query.where('status', payload.status)
    }

    const events = await query
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(events)
  }
}
