import type { HttpContext } from '@adonisjs/core/http'
import PlatformSettings from '#models/platform_settings'

export default class ShowPlatformSettingsController {
  async handle({}: HttpContext) {
    let settings = await PlatformSettings.first()

    if (!settings) {
      settings = await PlatformSettings.create({
        defaultTrialDays: 14,
        defaultPricePerStudent: 0,
      })
    }

    return settings
  }
}
