import type { HttpContext } from '@adonisjs/core/http'
import StoreFinancialSettings from '#models/store_financial_settings'
import { updateOwnFinancialSettingsValidator } from '#validators/store'
import StoreFinancialSettingsTransformer from '#transformers/store_financial_settings_transformer'

export default class UpdateFinancialSettingsController {
  async handle({ storeOwnerStore, request, response, serialize }: HttpContext) {
    const store = storeOwnerStore!
    const data = await request.validateUsing(updateOwnFinancialSettingsValidator)

    const settings = await StoreFinancialSettings.updateOrCreate({ storeId: store.id }, data)

    return response.ok(await serialize(StoreFinancialSettingsTransformer.transform(settings)))
  }
}
