import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'
import AppException from '#exceptions/app_exception'

export default class ShowStoreItemController {
  async handle({ params, response }: HttpContext) {
    const storeItem = await StoreItem.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .preload('school')
      .preload('canteenItem')
      .first()

    if (!storeItem) {
      throw AppException.notFound('Item da loja nao encontrado')
    }

    return response.ok(storeItem)
  }
}
