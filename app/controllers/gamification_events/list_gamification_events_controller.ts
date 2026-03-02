import type { HttpContext } from '@adonisjs/core/http'
import GamificationEvent from '#models/gamification_event'
import GamificationEventTransformer from '#transformers/gamification_event_transformer'
import { listGamificationEventsValidator } from '#validators/gamification'

export default class ListGamificationEventsController {
  async handle({ request, selectedSchoolIds, serialize }: HttpContext) {
    const payload = await request.validateUsing(listGamificationEventsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const query = GamificationEvent.query()

    // Filter by school - only show events from active students of the selected schools
    if (selectedSchoolIds && selectedSchoolIds.length > 0) {
      query.whereHas('student', (studentQuery) => {
        studentQuery
          .whereHas('user', (userQuery) => {
            userQuery.whereIn('schoolId', selectedSchoolIds)
          })
          .whereHas('levels', (levelQuery) => {
            levelQuery.whereNull('deletedAt')
          })
      })
    }

    if (payload.studentId) {
      query.where('studentId', payload.studentId)
    }

    if (payload.type) {
      query.where('type', payload.type)
    }

    if (payload.status) {
      if (payload.status === 'PROCESSED') {
        query.where('processed', true).whereNull('error')
      } else if (payload.status === 'FAILED') {
        query.whereNotNull('error')
      } else if (payload.status === 'PENDING') {
        query.where('processed', false).whereNull('error')
      }
    }

    const events = await query
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    const data = events.all()
    const metadata = events.getMeta()

    return serialize(GamificationEventTransformer.paginate(data, metadata))
  }
}
