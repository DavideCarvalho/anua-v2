import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import CanteenItem from '#models/canteen_item'
import CanteenItemDto from '#models/dto/canteen_item.dto'
import { updateCanteenItemValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'

export default class UpdateCanteenItemController {
  async handle({ params, request, response, selectedSchoolIds }: HttpContext) {
    const canteenItem = await CanteenItem.query()
      .where('id', params.id)
      .whereHas('canteen', (canteenQuery) => {
        canteenQuery.whereIn('schoolId', selectedSchoolIds ?? [])
      })
      .first()

    if (!canteenItem) {
      throw AppException.notFound('Item da cantina não encontrado')
    }

    const data = await request.validateUsing(updateCanteenItemValidator)

    const updatedCanteenItem = await db.transaction(async (trx) => {
      canteenItem.merge({
        name: data.name ?? canteenItem.name,
        description: data.description !== undefined ? data.description : canteenItem.description,
        price: data.price !== undefined ? data.price : canteenItem.price,
        category: data.category !== undefined ? data.category : canteenItem.category,
        isActive: data.isActive ?? canteenItem.isActive,
      })
      await canteenItem.useTransaction(trx).save()
      return canteenItem
    })

    return response.ok(new CanteenItemDto(updatedCanteenItem))
  }
}
