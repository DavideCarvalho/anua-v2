import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import vine from '@vinejs/vine'

const updateProfileValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    phone: vine.string().trim().optional(),
  })
)

export default class UpdateProfileController {
  async handle({ request, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const data = await request.validateUsing(updateProfileValidator)

    const user = await User.find(effectiveUser.id)
    if (!user) {
      return response.notFound({ message: 'Usuario nao encontrado' })
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
