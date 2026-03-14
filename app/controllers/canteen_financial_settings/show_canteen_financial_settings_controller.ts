import type { HttpContext } from '@adonisjs/core/http'
import CanteenFinancialSettings from '#models/canteen_financial_settings'
import CanteenFinancialSettingsDto from '#models/dto/canteen_financial_settings.dto'

export default class ShowCanteenFinancialSettingsController {
  async handle({ params, response }: HttpContext) {
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

    return response.ok(new CanteenFinancialSettingsDto(settings))
  }
}
