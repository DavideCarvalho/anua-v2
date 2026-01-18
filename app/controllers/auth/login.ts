import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/auth'

export default class LoginController {
  async handle({ request, response, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)

    if (!user.active) {
      return response.forbidden({ message: 'Usuário inativo' })
    }

    await auth.use('web').login(user)

    return response.ok({
      message: 'Login realizado com sucesso',
      user: await User.query()
        .where('id', user.id)
        .preload('role')
        .preload('school')
        .preload('schoolChain')
        .firstOrFail(),
    })
  }
}
