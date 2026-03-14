import type { HttpContext } from '@adonisjs/core/http'
import CanteenFinancialSettings from '#models/canteen_financial_settings'
import CanteenFinancialSettingsTransformer from '#transformers/canteen_financial_settings_transformer'

export default class ShowCanteenFinancialSettingsController {
  async handle({ params, response, serialize }: HttpContext) {
    const settings = await CanteenFinancialSettings.query()
      .where('canteenId', params.canteenId)
      .first()

    if (!settings) {
      return response.ok({
        canteenId: params.canteenId,
        platformFeePercentage: null,
        pixKey: null,
        pixKeyType: null,
        bankName: null,
        accountHolder: null,
      })
    }

    return response.ok(await serialize(CanteenFinancialSettingsTransformer.transform(settings)))
  }
}
