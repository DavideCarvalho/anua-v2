import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreItem from '#models/store_item'
import { updateStoreItemValidator } from '#validators/gamification'
import AppException from '#exceptions/app_exception'

export default class UpdateStoreItemController {
  async handle({ params, request, response }: HttpContext) {
    const storeItem = await StoreItem.query().where('id', params.id).whereNull('deletedAt').first()

    if (!storeItem) {
      throw AppException.notFound('Item da loja não encontrado')
    }

    const data = await request.validateUsing(updateStoreItemValidator)

    // Validate HYBRID mode percentages
    const paymentMode = data.paymentMode ?? storeItem.paymentMode
    if (paymentMode === 'HYBRID') {
      const minPercentage = data.minPointsPercentage ?? storeItem.minPointsPercentage ?? 0
      const maxPercentage = data.maxPointsPercentage ?? storeItem.maxPointsPercentage ?? 100

      if (minPercentage > maxPercentage) {
        throw AppException.badRequest(
          'A porcentagem mínima de pontos não pode ser maior que a porcentagem máxima'
        )
      }
    }

    // Convert dates and merge
    const { availableFrom, availableUntil, ...rest } = data
    storeItem.merge(rest)

    if (availableFrom !== undefined) {
      storeItem.availableFrom = availableFrom ? DateTime.fromJSDate(availableFrom) : null
    }
    if (availableUntil !== undefined) {
      storeItem.availableUntil = availableUntil ? DateTime.fromJSDate(availableUntil) : null
    }

    await storeItem.save()

    return response.ok(storeItem)
  }
}
