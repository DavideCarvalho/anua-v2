import type { HttpContext } from '@adonisjs/core/http'
import CanteenItem from '#models/canteen_item'
import { createCanteenItemValidator } from '#validators/canteen'

export default class CreateCanteenItemController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createCanteenItemValidator)

    const canteenItem = await CanteenItem.create({
      ...data,
      isActive: data.isActive ?? true,
    })

    return response.created(canteenItem)
  }
}
