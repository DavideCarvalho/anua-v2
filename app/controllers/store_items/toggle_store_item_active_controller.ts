import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'
import StoreItemDto from '#models/dto/store_item.dto'
import AppException from '#exceptions/app_exception'

export default class ToggleStoreItemActiveController {
  async handle({ params, response }: HttpContext) {
    const storeItem = await StoreItem.query().where('id', params.id).whereNull('deletedAt').first()

    if (!storeItem) {
      throw AppException.notFound('Item da loja não encontrado')
    }

    storeItem.isActive = !storeItem.isActive
    await storeItem.save()

    return response.ok(new StoreItemDto(storeItem))
  }
}
