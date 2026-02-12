import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { updateProfileValidator } from '#validators/responsavel'
import AppException from '#exceptions/app_exception'

export default class UpdateProfileController {
  async handle({ request, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const data = await request.validateUsing(updateProfileValidator)

    const user = await User.find(effectiveUser.id)
    if (!user) {
      throw AppException.notFound('Usuário não encontrado')
    }

    user.merge({
      name: data.name,
      phone: data.phone || null,
    })
    await user.save()

    return response.ok({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    })
  }
}
