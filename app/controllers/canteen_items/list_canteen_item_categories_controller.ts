import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'
import vine from '@vinejs/vine'

const listCategoriesValidator = vine.compile(
  vine.object({
    canteenId: vine.string().optional(),
  })
)

export default class ListCanteenItemCategoriesController {
  async handle({ request, response }: HttpContext) {
    const { canteenId } = await request.validateUsing(listCategoriesValidator)

    const query = CanteenItem.query()
      .whereNotNull('category')
      .where('category', '!=', '')
      .orderBy('category', 'asc')
      .select('category')

    if (canteenId) {
      query.where('canteenId', canteenId)
    }

    const rows = await query

    const categories = [...new Set(rows.map((r) => r.category as string))]

    return response.ok({ data: categories })
  }
}
