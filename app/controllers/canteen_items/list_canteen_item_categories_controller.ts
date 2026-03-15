import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'

export default class ListCanteenItemCategoriesController {
  async handle({ request, response }: HttpContext) {
    const canteenId = request.input('canteenId') as string | undefined

    const query = CanteenItem.query()
      .whereNotNull('category')
      .groupBy('category')
      .orderBy('category', 'asc')
      .select('category')

    if (canteenId) {
      query.where('canteenId', canteenId)
    }

    const rows = await query
    const categories = rows
      .map((row) => row.category)
      .filter((category): category is string => typeof category === 'string' && category.length > 0)

    return response.ok({ data: categories })
  }
}
