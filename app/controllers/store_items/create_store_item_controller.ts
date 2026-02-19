import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreItem from '#models/store_item'
import Store from '#models/store'
import { createStoreItemValidator } from '#validators/gamification'
import AppException from '#exceptions/app_exception'

export default class CreateStoreItemController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createStoreItemValidator)

    // Resolver schoolId a partir da loja
    const store = await Store.find(data.storeId)
    if (!store) {
      throw AppException.notFound('Loja não encontrada')
    }
    const schoolId = store.schoolId

    // Validate HYBRID mode percentages
    if (data.paymentMode === 'HYBRID') {
      const minPercentage = data.minPointsPercentage ?? 0
      const maxPercentage = data.maxPointsPercentage ?? 100

      if (minPercentage > maxPercentage) {
        throw AppException.badRequest(
          'A porcentagem mínima de pontos não pode ser maior que a porcentagem máxima'
        )
      }
    }

    const storeItem = await StoreItem.create({
      ...data,
      schoolId,
      description: data.description ?? '',
      availableFrom: data.availableFrom ? DateTime.fromJSDate(data.availableFrom) : null,
      availableUntil: data.availableUntil ? DateTime.fromJSDate(data.availableUntil) : null,
      isActive: data.isActive ?? true,
    })

    return response.created(storeItem)
  }
}
