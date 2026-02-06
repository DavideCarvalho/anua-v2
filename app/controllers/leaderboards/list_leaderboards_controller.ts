import type { HttpContext } from '@adonisjs/core/http'
import Leaderboard from '#models/leaderboard'
import LeaderboardDto from '#models/dto/leaderboard.dto'
import { listLeaderboardsValidator } from '#validators/gamification'

export default class ListLeaderboardsController {
  async handle({ request }: HttpContext) {
    const data = await request.validateUsing(listLeaderboardsValidator)

    const page = data.page ?? 1
    const limit = data.limit ?? 20

    const query = Leaderboard.query().orderBy('createdAt', 'desc')

    if (data.schoolId) {
      query.where('schoolId', data.schoolId)
    }

    if (data.type) {
      query.where('metricType', data.type)
    }

    if (data.scope) {
      // Map scope to appropriate column filters
      switch (data.scope) {
        case 'CLASS':
          query.whereNotNull('classId')
          break
        case 'SCHOOL':
          query.whereNull('classId').whereNull('subjectId')
          break
        case 'LEVEL':
          query.whereNotNull('subjectId')
          break
        case 'GLOBAL':
          query.whereNull('schoolId')
          break
      }
    }

    if (data.period) {
      query.where('periodType', data.period)
    }

    if (typeof data.isActive === 'boolean') {
      query.where('isActive', data.isActive)
    }

    const leaderboards = await query.paginate(page, limit)

    return LeaderboardDto.fromPaginator(leaderboards)
  }
}
