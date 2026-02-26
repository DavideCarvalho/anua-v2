import type { HttpContext } from '@adonisjs/core/http'
import Challenge from '#models/challenge'
import { listChallengesValidator } from '#validators/gamification'
import ChallengeDto from '#models/dto/challenge.dto'

export default class ListChallengesController {
  async handle({ request }: HttpContext) {
    const payload = await request.validateUsing(listChallengesValidator)

    const page = payload.page || 1
    const limit = payload.limit || 20

    const query = Challenge.query().orderBy('name', 'asc')

    if (payload.schoolId) {
      query.where('schoolId', payload.schoolId)
    }

    if (payload.category) {
      query.where('category', payload.category)
    }

    if (payload.isActive !== undefined) {
      query.where('isActive', payload.isActive)
    }

    const challenges = await query.paginate(page, limit)

    return ChallengeDto.fromPaginator(challenges)
  }
}
