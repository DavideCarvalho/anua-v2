import type { HttpContext } from '@adonisjs/core/http'
import StoreFinancialSettings from '#models/store_financial_settings'
import StoreFinancialSettingsDto from '#models/dto/store_financial_settings.dto'

export default class ShowStoreFinancialSettingsController {
  async handle({ params, response }: HttpContext) {
    const settings = await StoreFinancialSettings.query().where('storeId', params.storeId).first()

    if (!settings) {
      return response.ok({
        storeId: params.storeId,
        platformFeePercentage: null,
        pixKey: null,
        pixKeyType: null,
        bankName: null,
        accountHolder: null,
      })
    }

    return response.ok(new StoreFinancialSettingsDto(settings))
  }
}
