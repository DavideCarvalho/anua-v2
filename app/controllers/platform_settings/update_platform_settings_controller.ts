import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import PlatformSettings from '#models/platform_settings'
import PlatformSettingsDto from '#models/dto/platform_settings.dto'
import { updatePlatformSettingsValidator } from '#validators/subscription'

export default class UpdatePlatformSettingsController {
  async handle({ request }: HttpContext) {
    const data = await request.validateUsing(updatePlatformSettingsValidator)

    let settings = await PlatformSettings.first()

    if (!settings) {
      settings = await db.transaction(async (trx) => {
        return PlatformSettings.create(
          {
            defaultTrialDays: data.defaultTrialDays ?? 14,
            defaultPricePerStudent: data.defaultPricePerStudent ?? 0,
            defaultStorePlatformFeePercentage: data.defaultStorePlatformFeePercentage ?? 0,
          },
          { client: trx }
        )
      })

      return new PlatformSettingsDto(settings)
    }

    settings = await db.transaction(async (trx) => {
      settings!.merge({
        defaultTrialDays:
          data.defaultTrialDays !== undefined ? data.defaultTrialDays : settings!.defaultTrialDays,
        defaultPricePerStudent:
          data.defaultPricePerStudent !== undefined
            ? data.defaultPricePerStudent
            : settings!.defaultPricePerStudent,
        defaultStorePlatformFeePercentage:
          data.defaultStorePlatformFeePercentage !== undefined
            ? data.defaultStorePlatformFeePercentage
            : settings!.defaultStorePlatformFeePercentage,
      })
      await settings!.useTransaction(trx).save()
      return settings!
    })

    return new PlatformSettingsDto(settings)
  }
}
