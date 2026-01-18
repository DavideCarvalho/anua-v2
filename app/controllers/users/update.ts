import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import { updateUserValidator } from '#validators/user'

export default class UpdateUserController {
  async handle({ params, request, response }: HttpContext) {
    const user = await User.query().where('id', params.id).whereNull('deletedAt').first()

    if (!user) {
      return response.notFound({ message: 'Usuário não encontrado' })
    }

    const data = await request.validateUsing(updateUserValidator)

    if (data.email && data.email !== user.email) {
      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        return response.conflict({ message: 'Já existe um usuário com este email' })
      }
    }

    user.merge({
      ...data,
      birthDate: data.birthDate ? DateTime.fromJSDate(data.birthDate) : data.birthDate,
    })
    await user.save()

    const userWithRelations = await User.query()
      .where('id', user.id)
      .preload('role')
      .preload('school')
      .preload('schoolChain')
      .firstOrFail()

    return response.ok(userWithRelations)
  }
}
