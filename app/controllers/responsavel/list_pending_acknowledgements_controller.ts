import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementTransformer from '#transformers/school_announcement_transformer'
import AppException from '#exceptions/app_exception'

export default class ListPendingAcknowledgementsController {
  async handle({ response, auth, effectiveUser, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const now = DateTime.now()

    const announcements = await SchoolAnnouncement.query()
      .where('status', 'PUBLISHED')
      .where('requiresAcknowledgement', true)
      .where((query) => {
        query.whereNull('acknowledgementDueAt').orWhere('acknowledgementDueAt', '>=', now.toSQL())
      })
      .whereHas('recipients', (recipientQuery) => {
        recipientQuery.where('responsibleId', user.id).whereNull('acknowledgedAt')
      })
      .preload('creator')
      .preload('recipients', (recipientQuery) => {
        recipientQuery.where('responsibleId', user.id)
      })
      .orderBy('publishedAt', 'desc')

    return response.ok(await serialize(SchoolAnnouncementTransformer.transform(announcements)))
  }
}
