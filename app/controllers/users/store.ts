import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import { createUserValidator } from '#validators/user'
import string from '@adonisjs/core/helpers/string'
import AppException from '#exceptions/app_exception'
import UserTransformer from '#transformers/user_transformer'

export default class StoreUserController {
  async handle({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)

    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    const slug = string.slug(data.name, { lower: true })
    const { password: passwordInput, ...userData } = data
    void passwordInput

    const user = await User.create({
      ...userData,
      birthDate: data.birthDate ? DateTime.fromJSDate(data.birthDate) : null,
      slug,
      active: true,
    })

    const userWithRelations = await User.query()
      .where('id', user.id)
      .preload('role')
      .preload('school')
      .preload('schoolChain')
      .firstOrFail()

    return response.created(await serialize(UserTransformer.transform(userWithRelations)))
  }
}
