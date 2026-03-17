import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import StoreTransformer from '#transformers/store_transformer'

export default class ShowStoreController {
  async handle({ params, response, serialize }: HttpContext) {
    const store = await Store.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .preload('school')
      .preload('owner')
      .preload('financialSettings')
      .firstOrFail()

    return response.ok(await serialize(StoreTransformer.transform(store)))
  }
}
