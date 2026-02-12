import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'
import AppException from '#exceptions/app_exception'

export default class ShowCanteenItemController {
  async handle({ params, response }: HttpContext) {
    const canteenItem = await CanteenItem.query().where('id', params.id).preload('canteen').first()

    if (!canteenItem) {
      throw AppException.notFound('Item da cantina não encontrado')
    }

    return response.ok(canteenItem)
  }
}
