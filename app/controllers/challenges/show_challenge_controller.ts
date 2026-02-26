import type { HttpContext } from '@adonisjs/core/http'
import Challenge from '#models/challenge'
import ChallengeDto from '#models/dto/challenge.dto'

export default class ShowChallengeController {
  async handle({ params }: HttpContext) {
    const challenge = await Challenge.findOrFail(params.id)
    return new ChallengeDto(challenge)
  }
}
