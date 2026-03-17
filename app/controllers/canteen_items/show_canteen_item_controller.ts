import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'
import AppException from '#exceptions/app_exception'
import CanteenItemTransformer from '#transformers/canteen_item_transformer'

export default class ShowCanteenItemController {
  async handle({ params, response, serialize }: HttpContext) {
    const canteenItem = await CanteenItem.query().where('id', params.id).preload('canteen').first()

    if (!canteenItem) {
      throw AppException.notFound('Item da cantina não encontrado')
    }

    return response.ok(await serialize(CanteenItemTransformer.transform(canteenItem)))
  }
}
