import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import { createStoreValidator } from '#validators/store'
import StoreTransformer from '#transformers/store_transformer'

export default class CreateStoreController {
  async handle({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createStoreValidator)

    const store = await Store.create({
      ...data,
      isActive: data.isActive ?? true,
    })

    await store.load('school')
    if (store.ownerUserId) {
      await store.load('owner')
    }

    return response.created(await serialize(StoreTransformer.transform(store)))
  }
}
