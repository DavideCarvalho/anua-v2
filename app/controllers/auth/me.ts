import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AppException from '#exceptions/app_exception'

export default class MeController {
  async handle({ response, auth }: HttpContext) {
    const authenticatedUser = auth.use('web').user

    if (!authenticatedUser) {
      throw AppException.invalidCredentials()
    }

    const user = await User.query()
      .where('id', authenticatedUser.id)
      .preload('role')
      .preload('school')
      .preload('schoolChain')
      .firstOrFail()

    return response.ok(user)
  }
}
