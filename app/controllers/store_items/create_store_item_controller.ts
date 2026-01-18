import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreItem from '#models/store_item'
import { createStoreItemValidator } from '#validators/gamification'

export default class CreateStoreItemController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createStoreItemValidator)

    // Validate HYBRID mode percentages
    if (data.paymentMode === 'HYBRID') {
      const minPercentage = data.minPointsPercentage ?? 0
      const maxPercentage = data.maxPointsPercentage ?? 100

      if (minPercentage > maxPercentage) {
        return response.badRequest({
          message: 'A porcentagem mínima de pontos não pode ser maior que a porcentagem máxima',
        })
      }
    }

    const storeItem = await StoreItem.create({
      ...data,
      availableFrom: data.availableFrom ? DateTime.fromJSDate(data.availableFrom) : null,
      availableUntil: data.availableUntil ? DateTime.fromJSDate(data.availableUntil) : null,
      isActive: data.isActive ?? true,
    })

    return response.created(storeItem)
  }
}
