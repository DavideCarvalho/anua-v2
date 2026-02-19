import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreItem from '#models/store_item'
import AppException from '#exceptions/app_exception'

export default class DeleteStoreItemController {
  async handle({ params, response }: HttpContext) {
    const storeItem = await StoreItem.query().where('id', params.id).whereNull('deletedAt').first()

    if (!storeItem) {
      throw AppException.notFound('Item da loja não encontrado')
    }

    storeItem.deletedAt = DateTime.now()
    await storeItem.save()

    return response.noContent()
  }
}
