import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'
import AppException from '#exceptions/app_exception'

export default class DeleteCanteenItemController {
  async handle({ params, response }: HttpContext) {
    const canteenItem = await CanteenItem.find(params.id)

    if (!canteenItem) {
      throw AppException.notFound('Item da cantina não encontrado')
    }

    await canteenItem.delete()

    return response.noContent()
  }
}
