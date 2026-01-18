import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'

export default class ListItemsByCanteenController {
  async handle({ params, request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const isActive = request.input('isActive', true)

    const query = CanteenItem.query()
      .where('canteenId', params.canteenId)
      .where('isActive', isActive)
      .orderBy('name', 'asc')

    const canteenItems = await query.paginate(page, limit)

    return response.ok(canteenItems)
  }
}
