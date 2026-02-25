import type { HttpContext } from '@adonisjs/core/http'
import StoreFinancialSettings from '#models/store_financial_settings'
import StoreFinancialSettingsDto from '#models/dto/store_financial_settings.dto'
import { updateOwnFinancialSettingsValidator } from '#validators/store'

export default class UpdateFinancialSettingsController {
  async handle({ storeOwnerStore, request, response }: HttpContext) {
    const store = storeOwnerStore!
    const data = await request.validateUsing(updateOwnFinancialSettingsValidator)

    const settings = await StoreFinancialSettings.updateOrCreate({ storeId: store.id }, data)

    return response.ok(new StoreFinancialSettingsDto(settings))
  }
}
