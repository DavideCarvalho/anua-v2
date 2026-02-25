import type { HttpContext } from '@adonisjs/core/http'
import StoreFinancialSettings from '#models/store_financial_settings'
import StoreFinancialSettingsDto from '#models/dto/store_financial_settings.dto'

export default class ShowFinancialSettingsController {
  async handle({ storeOwnerStore, response }: HttpContext) {
    const store = storeOwnerStore!
    const settings = await StoreFinancialSettings.query().where('storeId', store.id).first()

    return response.ok(settings ? new StoreFinancialSettingsDto(settings) : null)
  }
}
