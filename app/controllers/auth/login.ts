import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/auth'
import UserDto from '#models/dto/user.dto'

export default class LoginController {
  async handle({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(loginValidator)

    const user = await User.findByOrFail('email', email)

    // await auth.use('web').login(user)

    return response.ok(new UserDto(user))
  }
}
