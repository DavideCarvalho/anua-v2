import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/auth'
import AppException from '#exceptions/app_exception'
import UserTransformer from '#transformers/user_transformer'

export default class LoginController {
  async handle({ request, response, serialize }: HttpContext) {
    const { email } = await request.validateUsing(loginValidator)

    const user = await User.findBy('email', email)

    if (!user) {
      throw AppException.invalidCredentials()
    }

    // await auth.use('web').login(user)

    return response.ok(await serialize(UserTransformer.transform(user)))
  }
}
