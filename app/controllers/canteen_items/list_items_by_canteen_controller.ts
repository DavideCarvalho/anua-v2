import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'
import CanteenItemDto from '#models/dto/canteen_item.dto'

export default class ListItemsByCanteenController {
  async handle({ params, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const isActive = request.input('isActive', true)

    const query = CanteenItem.query()
      .where('canteenId', params.canteenId)
      .where('isActive', isActive)
      .orderBy('name', 'asc')

    const canteenItems = await query.paginate(page, limit)

    return CanteenItemDto.fromPaginator(canteenItems)
  }
}
