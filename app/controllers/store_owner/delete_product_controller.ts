import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreItem from '#models/store_item'
import AppException from '#exceptions/app_exception'

export default class DeleteProductController {
  async handle({ storeOwnerStore, params, response }: HttpContext) {
    const store = storeOwnerStore!
    const item = await StoreItem.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .whereNull('deletedAt')
      .first()

    if (!item) {
      throw AppException.notFound('Produto não encontrado')
    }

    item.deletedAt = DateTime.now()
    await item.save()

    return response.noContent()
  }
}
