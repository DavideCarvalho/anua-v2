import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'
import StoreItemDto from '#models/dto/store_item.dto'
import AppException from '#exceptions/app_exception'

export default class ToggleProductActiveController {
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

    item.isActive = !item.isActive
    await item.save()

    return response.ok(new StoreItemDto(item))
  }
}
