import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'

export default class ShowStoreController {
  async handle({ params, response }: HttpContext) {
    const store = await Store.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .preload('school')
      .preload('owner')
      .preload('financialSettings')
      .firstOrFail()

    return response.ok(store)
  }
}
