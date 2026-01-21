import type { HttpContext } from '@adonisjs/core/http'
import NotificationPreference from '#models/notification_preference'

export default class ShowNotificationPreferencesController {
  async handle({ response, auth }: HttpContext) {
    const preferences = await NotificationPreference.query()
      .where('userId', auth.user!.id)
      .orderBy('type')
      .orderBy('channel')

    // Group preferences by type
    const grouped = preferences.reduce(
      (acc, pref) => {
        if (!acc[pref.type]) {
          acc[pref.type] = {}
        }
        acc[pref.type][pref.channel] = pref.enabled
        return acc
      },
      {} as Record<string, Record<string, boolean>>
    )

    return response.ok({
      preferences,
      grouped,
    })
  }
}
