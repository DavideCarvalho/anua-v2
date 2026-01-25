import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'

export default class DestroyUserController {
  async handle({ params, response, auth }: HttpContext) {
    const user = await User.query().where('id', params.id).whereNull('deletedAt').first()

    if (!user) {
      return response.notFound({ message: 'Usuário não encontrado' })
    }

    // Soft delete
    user.deletedAt = DateTime.now()
    user.deletedBy = auth.use('web').user?.id ?? null
    user.active = false
    await user.save()

    return response.noContent()
  }
}
