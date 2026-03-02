import type { HttpContext } from '@adonisjs/core/http'
import Challenge from '#models/challenge'
import ChallengeTransformer from '#transformers/challenge_transformer'
import { listChallengesValidator } from '#validators/gamification'

export default class ListChallengesController {
  async handle({ request, auth, serialize }: HttpContext) {
    const payload = await request.validateUsing(listChallengesValidator)

    const page = payload.page || 1
    const limit = payload.limit || 20

    const schoolId = payload.schoolId ?? auth.user?.schoolId

    const query = Challenge.query().orderBy('name', 'asc')

    if (schoolId) {
      const sid = schoolId
      query.where((q) => {
        q.where('schoolId', sid).orWhereNull('schoolId')
      })
    }

    if (payload.category) {
      query.where('category', payload.category)
    }

    if (payload.isActive !== undefined) {
      query.where('isActive', payload.isActive)
    }

    const challenges = await query.paginate(page, limit)

    const data = challenges.all()
    const metadata = challenges.getMeta()

    return serialize(ChallengeTransformer.paginate(data, metadata))
  }
}
