import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'
import CanteenItemDto from '#models/dto/canteen_item.dto'
import { listCanteenItemsValidator } from '#validators/canteen'

export default class ListCanteenItemsController {
  async handle({ request }: HttpContext) {
    const data = await request.validateUsing(listCanteenItemsValidator)

    const page = data.page ?? 1
    const limit = data.limit ?? 20

    const query = CanteenItem.query().preload('canteen').orderBy('name', 'asc')

    if (data.canteenId) {
      query.where('canteenId', data.canteenId)
    }

    if (data.category) {
      query.where('category', data.category)
    }

    if (data.isActive !== undefined) {
      query.where('isActive', data.isActive)
    }

    const canteenItems = await query.paginate(page, limit)

    return CanteenItemDto.fromPaginator(canteenItems)
  }
}
