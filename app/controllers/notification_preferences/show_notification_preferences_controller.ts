import type { HttpContext } from '@adonisjs/core/http'
import NotificationPreference from '#models/notification_preference'

export default class ShowNotificationPreferencesController {
  async handle({ response, auth }: HttpContext) {
    const preferences = await NotificationPreference.query()
      .where('userId', auth.user!.id)
      .orderBy('notificationType')

    // Group preferences by notification type with all channels
    const grouped = preferences.reduce(
      (acc, pref) => {
        acc[pref.notificationType] = {
          inApp: pref.enableInApp,
          email: pref.enableEmail,
          push: pref.enablePush,
          sms: pref.enableSms,
          whatsApp: pref.enableWhatsApp,
        }
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
