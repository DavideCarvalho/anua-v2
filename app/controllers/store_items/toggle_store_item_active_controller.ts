import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'
import AppException from '#exceptions/app_exception'
import StoreItemTransformer from '#transformers/store_item_transformer'

export default class ToggleStoreItemActiveController {
  async handle({ params, response, serialize }: HttpContext) {
    const storeItem = await StoreItem.query().where('id', params.id).whereNull('deletedAt').first()

    if (!storeItem) {
      throw AppException.notFound('Item da loja não encontrado')
    }

    storeItem.isActive = !storeItem.isActive
    await storeItem.save()

    return response.ok(await serialize(StoreItemTransformer.transform(storeItem)))
  }
}
