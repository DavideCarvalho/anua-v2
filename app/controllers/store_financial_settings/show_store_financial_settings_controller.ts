import type { HttpContext } from '@adonisjs/core/http'
import StoreFinancialSettings from '#models/store_financial_settings'
import StoreFinancialSettingsTransformer from '#transformers/store_financial_settings_transformer'

export default class ShowStoreFinancialSettingsController {
  async handle({ params, response, serialize }: HttpContext) {
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

    return response.ok(await serialize(StoreFinancialSettingsTransformer.transform(settings)))
  }
}
