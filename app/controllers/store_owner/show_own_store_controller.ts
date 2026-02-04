import type { HttpContext } from '@adonisjs/core/http'

export default class ShowOwnStoreController {
  async handle({ storeOwnerStore, response }: HttpContext) {
    const store = storeOwnerStore!
    await store.load('financialSettings')
    await store.load('owner')
    return response.ok(store)
  }
}
