import type { HttpContext } from '@adonisjs/core/http'
import Challenge from '#models/challenge'
import ChallengeTransformer from '#transformers/challenge_transformer'

export default class ShowChallengeController {
  async handle({ params, serialize }: HttpContext) {
    const challenge = await Challenge.findOrFail(params.id)
    return serialize(ChallengeTransformer.transform(challenge))
  }
}
