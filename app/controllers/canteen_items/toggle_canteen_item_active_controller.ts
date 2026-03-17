import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'
import AppException from '#exceptions/app_exception'
import CanteenItemTransformer from '#transformers/canteen_item_transformer'

export default class ToggleCanteenItemActiveController {
  async handle({ params, response, serialize }: HttpContext) {
    const canteenItem = await CanteenItem.find(params.id)

    if (!canteenItem) {
      throw AppException.notFound('Item da cantina não encontrado')
    }

    canteenItem.isActive = !canteenItem.isActive
    await canteenItem.save()

    return response.ok(await serialize(CanteenItemTransformer.transform(canteenItem)))
  }
}
