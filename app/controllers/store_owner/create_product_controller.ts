import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreItem from '#models/store_item'
import { createStoreItemValidator } from '#validators/gamification'
import AppException from '#exceptions/app_exception'

export default class CreateProductController {
  async handle({ storeOwnerStore, request, response }: HttpContext) {
    const store = storeOwnerStore!
    const data = await request.validateUsing(createStoreItemValidator)

    if (data.paymentMode === 'HYBRID') {
      const min = data.minPointsPercentage ?? 0
      const max = data.maxPointsPercentage ?? 100
      if (min > max) {
        throw AppException.badRequest(
          'minPointsPercentage deve ser menor ou igual a maxPointsPercentage'
        )
      }
    }

    const item = await StoreItem.create({
      ...data,
      availableFrom: data.availableFrom ? DateTime.fromJSDate(data.availableFrom) : null,
      availableUntil: data.availableUntil ? DateTime.fromJSDate(data.availableUntil) : null,
      schoolId: store.schoolId,
      storeId: store.id,
      isActive: data.isActive ?? true,
    })

    return response.created(item)
  }
}
