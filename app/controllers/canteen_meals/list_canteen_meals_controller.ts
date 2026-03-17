import type { HttpContext } from '@adonisjs/core/http'
import type { SimplePaginatorMetaKeys } from '@adonisjs/lucid/types/querybuilder'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import CanteenMeal from '#models/canteen_meal'
import CanteenMealTransformer from '#transformers/canteen_meal_transformer'
import { listCanteenMealsValidator } from '#validators/canteen'

export default class ListCanteenMealsController {
  async handle({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(listCanteenMealsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const query = CanteenMeal.query().preload('canteen').orderBy('date', 'asc')

    if (payload.canteenId) {
      query.where('canteenId', payload.canteenId)
    }

    if (payload.isActive !== undefined) {
      query.where('isActive', payload.isActive)
    }

    if (payload.mealType) {
      query.where('mealType', payload.mealType)
    }

    if (payload.servedAt) {
      const date = DateTime.fromJSDate(payload.servedAt).toISODate()
      if (date) {
        query.where('date', date)
      }
    }

    let data: CanteenMeal[]
    let metadata: SimplePaginatorMetaKeys

    if (payload.uniqueForImport) {
      const conditions: string[] = []
      const bindings: Record<string, unknown> = {}
      if (payload.canteenId) {
        conditions.push('"canteenId" = :canteenId')
        bindings.canteenId = payload.canteenId
      }
      if (payload.isActive !== undefined) {
        conditions.push('"isActive" = :isActive')
        bindings.isActive = payload.isActive
      }
      if (payload.mealType) {
        conditions.push('"mealType" = :mealType')
        bindings.mealType = payload.mealType
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      const idsResult = await db.rawQuery<{ rows: { id: string }[] }>(
        `
        SELECT id FROM (
          SELECT DISTINCT ON ("name", "price") id
          FROM "CanteenMeal"
          ${whereClause}
          ORDER BY "name", "price", "date" DESC
          LIMIT 500
        ) sub
        `,
        bindings
      )
      const ids = idsResult.rows.map((r) => r.id)
      data =
        ids.length > 0
          ? await CanteenMeal.query().whereIn('id', ids).preload('canteen').orderBy('date', 'asc')
          : []
      metadata = {
        total: data.length,
        perPage: data.length,
        currentPage: 1,
        lastPage: 1,
        firstPage: 1,
        firstPageUrl: '',
        lastPageUrl: '',
        nextPageUrl: '',
        previousPageUrl: '',
      }
    } else {
      const meals = await query.paginate(page, limit)
      data = meals.all()
      metadata = meals.getMeta()
    }

    return serialize(CanteenMealTransformer.paginate(data, metadata))
  }
}
