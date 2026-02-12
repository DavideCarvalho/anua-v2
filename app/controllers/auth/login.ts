import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/auth'
import UserDto from '#models/dto/user.dto'
import AppException from '#exceptions/app_exception'

export default class LoginController {
  async handle({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(loginValidator)

    const user = await User.findBy('email', email)

    if (!user) {
      throw AppException.invalidCredentials()
    }

    // await auth.use('web').login(user)

    return response.ok(new UserDto(user))
  }
}
