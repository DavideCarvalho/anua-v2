import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'
import CanteenItemDto from '#models/dto/canteen_item.dto'
import AppException from '#exceptions/app_exception'

export default class ToggleCanteenItemActiveController {
  async handle({ params, response }: HttpContext) {
    const canteenItem = await CanteenItem.find(params.id)

    if (!canteenItem) {
      throw AppException.notFound('Item da cantina não encontrado')
    }

    canteenItem.isActive = !canteenItem.isActive
    await canteenItem.save()

    return response.ok(new CanteenItemDto(canteenItem))
  }
}
