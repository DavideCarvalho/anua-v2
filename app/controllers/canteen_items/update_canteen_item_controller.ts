import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'
import { updateCanteenItemValidator } from '#validators/canteen'

export default class UpdateCanteenItemController {
  async handle({ params, request, response }: HttpContext) {
    const canteenItem = await CanteenItem.find(params.id)

    if (!canteenItem) {
      return response.notFound({ message: 'Item da cantina não encontrado' })
    }

    const data = await request.validateUsing(updateCanteenItemValidator)

    canteenItem.merge(data)
    await canteenItem.save()

    return response.ok(canteenItem)
  }
}
