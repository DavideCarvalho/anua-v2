import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class ShowUserController {
  async handle({ params, response }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .preload('role')
      .preload('school')
      .preload('schoolChain')
      .first()

    if (!user) {
      return response.notFound({ message: 'Usuário não encontrado' })
    }

    return response.ok(user)
  }
}
