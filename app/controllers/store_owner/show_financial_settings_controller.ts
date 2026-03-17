import type { HttpContext } from '@adonisjs/core/http'
import StoreFinancialSettings from '#models/store_financial_settings'
import StoreFinancialSettingsTransformer from '#transformers/store_financial_settings_transformer'

export default class ShowFinancialSettingsController {
  async handle({ storeOwnerStore, response, serialize }: HttpContext) {
    const store = storeOwnerStore!
    const settings = await StoreFinancialSettings.query().where('storeId', store.id).first()

    return response.ok(
      settings ? await serialize(StoreFinancialSettingsTransformer.transform(settings)) : null
    )
  }
}
