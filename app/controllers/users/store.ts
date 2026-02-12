import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import { createUserValidator } from '#validators/user'
import string from '@adonisjs/core/helpers/string'
import AppException from '#exceptions/app_exception'

export default class StoreUserController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)

    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    const slug = string.slug(data.name, { lower: true })

    const user = await User.create({
      ...data,
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

    return response.created(userWithRelations)
  }
}
