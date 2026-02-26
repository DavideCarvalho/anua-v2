import type { HttpContext } from '@adonisjs/core/http'
import Challenge from '#models/challenge'

export default class DeleteChallengeController {
  async handle({ params }: HttpContext) {
    const challenge = await Challenge.findOrFail(params.id)
    await challenge.delete()
    return { success: true }
  }
}
