import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'

export default class ToggleProductActiveController {
  async handle({ storeOwnerStore, params, response }: HttpContext) {
    const store = storeOwnerStore!
    const item = await StoreItem.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .whereNull('deletedAt')
      .first()

    if (!item) {
      return response.notFound({ message: 'Produto não encontrado' })
    }

    item.isActive = !item.isActive
    await item.save()

    return response.ok(item)
  }
}
