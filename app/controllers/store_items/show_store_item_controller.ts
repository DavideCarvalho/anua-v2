import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'

export default class ShowStoreItemController {
  async handle({ params, response }: HttpContext) {
    const storeItem = await StoreItem.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .preload('school')
      .preload('canteenItem')
      .first()

    if (!storeItem) {
      return response.notFound({ message: 'Item da loja não encontrado' })
    }

    return response.ok(storeItem)
  }
}
