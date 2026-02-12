import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreItem from '#models/store_item'
import { updateStoreItemValidator } from '#validators/gamification'
import AppException from '#exceptions/app_exception'

export default class UpdateProductController {
  async handle({ storeOwnerStore, params, request, response }: HttpContext) {
    const store = storeOwnerStore!
    const item = await StoreItem.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .whereNull('deletedAt')
      .first()

    if (!item) {
      throw AppException.notFound('Produto nao encontrado')
    }

    const data = await request.validateUsing(updateStoreItemValidator)

    const effectivePaymentMode = data.paymentMode ?? item.paymentMode
    if (effectivePaymentMode === 'HYBRID') {
      const min = data.minPointsPercentage ?? item.minPointsPercentage ?? 0
      const max = data.maxPointsPercentage ?? item.maxPointsPercentage ?? 100
      if (min > max) {
        throw AppException.badRequest(
          'minPointsPercentage deve ser menor ou igual a maxPointsPercentage'
        )
      }
    }

    const { availableFrom, availableUntil, ...rest } = data
    item.merge(rest)

    if (availableFrom !== undefined) {
      item.availableFrom = availableFrom ? DateTime.fromJSDate(availableFrom) : null
    }
    if (availableUntil !== undefined) {
      item.availableUntil = availableUntil ? DateTime.fromJSDate(availableUntil) : null
    }

    await item.save()

    return response.ok(item)
  }
}
