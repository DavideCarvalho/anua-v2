import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import { updateUserValidator } from '#validators/user'
import AppException from '#exceptions/app_exception'
import UserTransformer from '#transformers/user_transformer'

export default class UpdateUserController {
  async handle({ params, request, response, selectedSchoolIds, serialize }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .whereHas('userHasSchools', (schoolQuery) => {
        schoolQuery.whereIn('schoolId', selectedSchoolIds ?? [])
      })
      .first()

    if (!user) {
      throw AppException.notFound('Usuário não encontrado')
    }

    const data = await request.validateUsing(updateUserValidator)

    if (data.email && data.email !== user.email) {
      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        throw AppException.operationFailedWithProvidedData(409)
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

    return response.ok(await serialize(UserTransformer.transform(userWithRelations)))
  }
}
