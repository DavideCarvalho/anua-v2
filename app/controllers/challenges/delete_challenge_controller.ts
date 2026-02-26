import type { HttpContext } from '@adonisjs/core/http'
import Challenge from '#models/challenge'

export default class DeleteChallengeController {
  async handle({ params, auth }: HttpContext) {
    const challenge = await Challenge.findOrFail(params.id)

    const userSchoolId = auth.user?.schoolId
    if (userSchoolId && challenge.schoolId !== userSchoolId) {
      throw new Error('Unauthorized: You can only delete challenges from your school')
    }

    await challenge.delete()
    return { success: true }
  }
}
