import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreItem from '#models/store_item'
import Store from '#models/store'
import { createStoreItemValidator } from '#validators/gamification'
import AppException from '#exceptions/app_exception'
import StoreItemTransformer from '#transformers/store_item_transformer'

export default class CreateStoreItemController {
  async handle({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createStoreItemValidator)

    let schoolId: string
    let storeId: string | null = null

    if (data.schoolId) {
      schoolId = data.schoolId
      storeId = null
    } else if (data.storeId) {
      const store = await Store.find(data.storeId)
      if (!store) {
        throw AppException.notFound('Loja não encontrada')
      }
      schoolId = store.schoolId
      storeId = data.storeId
    } else {
      throw AppException.badRequest('Informe storeId ou schoolId')
    }

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

    const { storeId: omittedStoreId, schoolId: omittedSchoolId, ...rest } = data
    void omittedStoreId
    void omittedSchoolId
    const storeItem = await StoreItem.create({
      ...rest,
      storeId,
      schoolId,
      description: data.description ?? '',
      availableFrom: data.availableFrom ? DateTime.fromJSDate(data.availableFrom) : null,
      availableUntil: data.availableUntil ? DateTime.fromJSDate(data.availableUntil) : null,
      isActive: data.isActive ?? true,
    })

    return response.created(await serialize(StoreItemTransformer.transform(storeItem)))
  }
}
