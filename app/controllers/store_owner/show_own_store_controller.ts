import type { HttpContext } from '@adonisjs/core/http'
import StoreTransformer from '#transformers/store_transformer'

export default class ShowOwnStoreController {
  async handle({ storeOwnerStore, response, serialize }: HttpContext) {
    const store = storeOwnerStore!
    await store.load('financialSettings')
    await store.load('owner')
    return response.ok(await serialize(StoreTransformer.transform(store)))
  }
}
