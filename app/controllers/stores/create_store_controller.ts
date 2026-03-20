import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import { createStoreValidator } from '#validators/store'
import StoreTransformer from '#transformers/store_transformer'
import UserHasSchool from '#models/user_has_school'
import AppException from '#exceptions/app_exception'

export default class CreateStoreController {
  async handle({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createStoreValidator)

    let ownerUserId = data.ownerUserId ?? null
    let commissionPercentage = data.commissionPercentage

    if (data.type === 'INTERNAL') {
      const directorRelation = await UserHasSchool.query()
        .where('schoolId', data.schoolId)
        .preload('user', (userQuery) => {
          userQuery.preload('role')
        })
        .whereHas('user', (userQuery) => {
          userQuery.whereHas('role', (roleQuery) => {
            roleQuery.where('name', 'SCHOOL_DIRECTOR')
          })
        })
        .first()

      ownerUserId = directorRelation?.userId ?? null
      commissionPercentage = undefined
    }

    if (data.type === 'THIRD_PARTY') {
      if (!ownerUserId) {
        throw AppException.badRequest('Selecione um responsável para loja terceirizada')
      }

      const hasSchool = await UserHasSchool.query()
        .where('userId', ownerUserId)
        .where('schoolId', data.schoolId)
        .first()

      if (!hasSchool) {
        throw AppException.badRequest('Responsável não pertence a esta escola')
      }
    }

    const store = await Store.create({
      ...data,
      ownerUserId,
      commissionPercentage,
      isActive: data.isActive ?? true,
    })

    await store.load('school')
    if (store.ownerUserId) {
      await store.load('owner')
    }

    return response.created(await serialize(StoreTransformer.transform(store)))
  }
}
