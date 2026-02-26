import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Challenge from '#models/challenge'
import { createChallengeValidator } from '#validators/gamification'
import ChallengeDto from '#models/dto/challenge.dto'

export default class CreateChallengeController {
  async handle({ request, effectiveUser }: HttpContext) {
    const payload = await request.validateUsing(createChallengeValidator)

    const schoolId = payload.schoolId ?? effectiveUser?.schoolId

    const challenge = await Challenge.create({
      name: payload.name,
      description: payload.description,
      icon: payload.icon,
      points: payload.points,
      category: payload.category,
      criteria: payload.criteria,
      isRecurring: payload.isRecurring ?? false,
      recurrencePeriod: payload.recurrencePeriod ?? null,
      startDate: payload.startDate ? DateTime.fromJSDate(payload.startDate) : null,
      endDate: payload.endDate ? DateTime.fromJSDate(payload.endDate) : null,
      schoolId: schoolId ?? null,
      isActive: payload.isActive ?? true,
    })

    return new ChallengeDto(challenge)
  }
}
