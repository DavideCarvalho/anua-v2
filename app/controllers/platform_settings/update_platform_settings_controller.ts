import type { HttpContext } from '@adonisjs/core/http'
import PlatformSettings from '#models/platform_settings'
import { updatePlatformSettingsValidator } from '#validators/subscription'

export default class UpdatePlatformSettingsController {
  async handle({ request }: HttpContext) {
    const data = await request.validateUsing(updatePlatformSettingsValidator)

    let settings = await PlatformSettings.first()

    if (!settings) {
      settings = await PlatformSettings.create({
        defaultTrialDays: data.defaultTrialDays ?? 14,
        defaultPricePerStudent: data.defaultPricePerStudent ?? 0,
      })
      return settings
    }

    settings.merge(data)
    await settings.save()

    return settings
  }
}
