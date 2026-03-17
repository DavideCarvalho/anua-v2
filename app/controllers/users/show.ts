import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AppException from '#exceptions/app_exception'
import UserTransformer from '#transformers/user_transformer'

export default class ShowUserController {
  async handle({ params, response, serialize }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .preload('role')
      .preload('school')
      .preload('schoolChain')
      .first()

    if (!user) {
      throw AppException.notFound('Usuário não encontrado')
    }

    return response.ok(await serialize(UserTransformer.transform(user)))
  }
}
