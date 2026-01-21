import type { HttpContext } from '@adonisjs/core/http'
import NotificationPreference from '#models/notification_preference'
import { updateNotificationPreferencesValidator } from '#validators/notification'
import { randomUUID } from 'node:crypto'

export default class UpdateNotificationPreferencesController {
  async handle({ request, response, auth }: HttpContext) {
    const { preferences } = await request.validateUsing(updateNotificationPreferencesValidator)

    const userId = auth.user!.id
    const results = []

    for (const pref of preferences) {
      // Try to find existing preference
      let existing = await NotificationPreference.query()
        .where('userId', userId)
        .where('type', pref.type)
        .where('channel', pref.channel)
        .first()

      if (existing) {
        // Update existing
        existing.enabled = pref.enabled
        await existing.save()
        results.push(existing)
      } else {
        // Create new
        const newPref = await NotificationPreference.create({
          id: randomUUID(),
          userId,
          type: pref.type,
          channel: pref.channel,
          enabled: pref.enabled,
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
