import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Store from '#models/store'

export default class DeleteStoreController {
  async handle({ params, response }: HttpContext) {
    const store = await Store.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .firstOrFail()

    store.deletedAt = DateTime.now()
    await store.save()

    return response.noContent()
  }
}
