import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import School from '#models/school'
import AppException from '#exceptions/app_exception'

export default class GetMarketplaceStoreContextController {
  async handle({ params }: HttpContext) {
    const { storeId } = params

    const store = await Store.query()
      .where('id', storeId)
      .whereNull('deletedAt')
      .where('isActive', true)
      .first()

    if (!store) {
      throw AppException.notFound('Loja não encontrada')
    }

    const school = await School.find(store.schoolId)

    return {
      hasOnlinePayment: school?.paymentConfigStatus === 'ACTIVE',
    }
  }
}
