import type { HttpContext } from '@adonisjs/core/http'
import Store from '#models/store'
import StoreFinancialSettings from '#models/store_financial_settings'
import { upsertStoreFinancialSettingsValidator } from '#validators/store'
import StoreFinancialSettingsTransformer from '#transformers/store_financial_settings_transformer'

export default class UpsertStoreFinancialSettingsController {
  async handle({ params, request, response, serialize }: HttpContext) {
    // Verify store exists
    await Store.query().where('id', params.storeId).whereNull('deletedAt').firstOrFail()

    const data = await request.validateUsing(upsertStoreFinancialSettingsValidator)

    const settings = await StoreFinancialSettings.updateOrCreate(
      { storeId: params.storeId },
      {
        storeId: params.storeId,
        ...data,
      }
    )

    return response.ok(await serialize(StoreFinancialSettingsTransformer.transform(settings)))
  }
}
