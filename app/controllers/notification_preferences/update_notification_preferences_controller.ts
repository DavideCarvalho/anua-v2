import type { HttpContext } from '@adonisjs/core/http'
import NotificationPreference from '#models/notification_preference'
import { updateNotificationPreferencesValidator } from '#validators/notification'
import { randomUUID } from 'node:crypto'

// Map validator channel to model field name
function getChannelField(channel: string): keyof NotificationPreference | null {
  switch (channel) {
    case 'IN_APP':
      return 'enableInApp'
    case 'EMAIL':
      return 'enableEmail'
    case 'PUSH':
      return 'enablePush'
    case 'SMS':
      return 'enableSms'
    case 'WHATSAPP':
      return 'enableWhatsApp'
    default:
      return null
  }
}

export default class UpdateNotificationPreferencesController {
  async handle({ request, response, auth }: HttpContext) {
    const { preferences } = await request.validateUsing(updateNotificationPreferencesValidator)

    const userId = auth.user!.id
    const results: NotificationPreference[] = []

    // Group preferences by notification type
    const prefsByType = new Map<string, { channel: string; enabled: boolean }[]>()
    for (const pref of preferences) {
      // Validator provides 'type', model expects 'notificationType'
      const existing = prefsByType.get(pref.type) || []
      existing.push({ channel: pref.channel, enabled: pref.enabled })
      prefsByType.set(pref.type, existing)
    }

    for (const [notificationType, channelPrefs] of prefsByType) {
      // Try to find existing preference for this notification type
      let existing = await NotificationPreference.query()
        .where('userId', userId)
        .where('notificationType', notificationType)
        .first()

      if (existing) {
        // Update existing - apply each channel preference
        for (const { channel, enabled } of channelPrefs) {
          const field = getChannelField(channel)
          if (field === 'enableInApp') existing.enableInApp = enabled
          else if (field === 'enableEmail') existing.enableEmail = enabled
          else if (field === 'enablePush') existing.enablePush = enabled
          else if (field === 'enableSms') existing.enableSms = enabled
          else if (field === 'enableWhatsApp') existing.enableWhatsApp = enabled
        }
        await existing.save()
        results.push(existing)
      } else {
        // Build channel settings from provided preferences
        let enableInApp = true
        let enableEmail = true
        let enablePush = true
        let enableSms = false
        let enableWhatsApp = false

        for (const { channel, enabled } of channelPrefs) {
          const field = getChannelField(channel)
          if (field === 'enableInApp') enableInApp = enabled
          else if (field === 'enableEmail') enableEmail = enabled
          else if (field === 'enablePush') enablePush = enabled
          else if (field === 'enableSms') enableSms = enabled
          else if (field === 'enableWhatsApp') enableWhatsApp = enabled
        }

        // Create new with the computed settings
        const newPref = await NotificationPreference.create({
          id: randomUUID(),
          userId,
          notificationType: notificationType as NotificationPreference['notificationType'],
          enableInApp,
          enableEmail,
          enablePush,
          enableSms,
          enableWhatsApp,
        })
        results.push(newPref)
      }
    }

    return response.ok({
      message: 'Preferences updated successfully',
      preferences: results,
    })
  }
}
