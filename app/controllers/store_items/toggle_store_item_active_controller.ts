import type { HttpContext } from '@adonisjs/core/http'
import StoreItem from '#models/store_item'

export default class ToggleStoreItemActiveController {
  async handle({ params, response }: HttpContext) {
    const storeItem = await StoreItem.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .first()

    if (!storeItem) {
      return response.notFound({ message: 'Item da loja não encontrado' })
    }

    storeItem.isActive = !storeItem.isActive
    await storeItem.save()

    return response.ok(storeItem)
  }
}
