import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'
import CanteenItemTransformer from '#transformers/canteen_item_transformer'
import { listCanteenItemsValidator } from '#validators/canteen'

export default class ListCanteenItemsController {
  async handle({ request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listCanteenItemsValidator)

    const page = filters.page ?? 1
    const limit = filters.limit ?? 20

    const query = CanteenItem.query().orderBy('name', 'asc')

    if (filters.canteenId) {
      query.where('canteenId', filters.canteenId)
    }

    if (filters.search) {
      query.where((searchQuery) => {
        searchQuery
          .whereILike('name', `%${filters.search}%`)
          .orWhereILike('description', `%${filters.search}%`)
      })
    }

    if (filters.category) {
      query.where('category', filters.category)
    }

    if (filters.isActive !== undefined) {
      query.where('isActive', filters.isActive)
    }

    const canteenItems = await query.paginate(page, limit)

    const items = canteenItems.all()
    const metadata = canteenItems.getMeta()

    return serialize(CanteenItemTransformer.paginate(items, metadata))
  }
}
