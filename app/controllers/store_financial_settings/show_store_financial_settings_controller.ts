import type { HttpContext } from '@adonisjs/core/http'
import StoreFinancialSettings from '#models/store_financial_settings'

export default class ShowStoreFinancialSettingsController {
  async handle({ params, response }: HttpContext) {
    const settings = await StoreFinancialSettings.query()
      .where('storeId', params.storeId)
      .firstOrFail()

    return response.ok(settings)
  }
}
