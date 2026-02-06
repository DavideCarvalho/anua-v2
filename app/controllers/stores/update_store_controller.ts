import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import { updateStoreValidator } from '#validators/store'

export default class UpdateStoreController {
  async handle({ params, request, response }: HttpContext) {
    const store = await Store.query().where('id', params.id).whereNull('deletedAt').firstOrFail()

    const data = await request.validateUsing(updateStoreValidator)

    store.merge(data)
    await store.save()

    await store.load('school')
    if (store.ownerUserId) {
      await store.load('owner')
    }

    return response.ok(store)
  }
}
