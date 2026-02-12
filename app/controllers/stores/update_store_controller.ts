import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Store from '#models/store'
import StoreDto from '#models/dto/store.dto'
import { updateStoreValidator } from '#validators/store'

export default class UpdateStoreController {
  async handle({ params, request, response }: HttpContext) {
    const store = await Store.query().where('id', params.id).whereNull('deletedAt').firstOrFail()

    const data = await request.validateUsing(updateStoreValidator)

    // Usa transaction e extrai campos explicitamente (evita mass assignment)
    const updatedStore = await db.transaction(async (trx) => {
      store.merge({
        name: data.name ?? store.name,
        description: data.description !== undefined ? data.description : store.description,
        type: data.type ?? store.type,
        ownerUserId: data.ownerUserId !== undefined ? data.ownerUserId : store.ownerUserId,
        commissionPercentage:
          data.commissionPercentage !== undefined
            ? data.commissionPercentage
            : store.commissionPercentage,
        isActive: data.isActive ?? store.isActive,
      })

      await store.useTransaction(trx).save()
      return store
    })

    await updatedStore.load('school')
    if (updatedStore.ownerUserId) {
      await updatedStore.load('owner')
    }

    return response.ok(new StoreDto(updatedStore))
  }
}
