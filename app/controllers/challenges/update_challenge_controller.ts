import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Challenge from '#models/challenge'
import { updateChallengeValidator } from '#validators/gamification'
import ChallengeDto from '#models/dto/challenge.dto'

export default class UpdateChallengeController {
  async handle({ request, params, auth }: HttpContext) {
    const challenge = await Challenge.findOrFail(params.id)

    const userSchoolId = auth.user?.schoolId
    if (userSchoolId && challenge.schoolId !== userSchoolId) {
      throw new Error('Unauthorized: You can only update challenges from your school')
    }

    const payload = await request.validateUsing(updateChallengeValidator)

    if (payload.name !== undefined) challenge.name = payload.name
    if (payload.description !== undefined) challenge.description = payload.description
    if (payload.icon !== undefined) challenge.icon = payload.icon
    if (payload.points !== undefined) challenge.points = payload.points
    if (payload.category !== undefined) challenge.category = payload.category
    if (payload.criteria !== undefined) challenge.criteria = payload.criteria
    if (payload.isRecurring !== undefined) challenge.isRecurring = payload.isRecurring
    if (payload.recurrencePeriod !== undefined)
      challenge.recurrencePeriod = payload.recurrencePeriod
    if (payload.startDate !== undefined)
      challenge.startDate = payload.startDate ? DateTime.fromJSDate(payload.startDate) : null
    if (payload.endDate !== undefined)
      challenge.endDate = payload.endDate ? DateTime.fromJSDate(payload.endDate) : null
    if (payload.isActive !== undefined) challenge.isActive = payload.isActive

    await challenge.save()

    return new ChallengeDto(challenge)
  }
}
