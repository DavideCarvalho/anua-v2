import type { HttpContext } from '@adonisjs/core/http'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementTransformer from '#transformers/school_announcement_transformer'
import AppException from '#exceptions/app_exception'
import { getRecipientAcknowledgementStatus } from '#services/school_announcements/school_announcement_acknowledgement_service'

export default class ShowComunicadoController {
  async handle({ params, response, auth, effectiveUser, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const announcement = await SchoolAnnouncement.query()
      .where('id', params.id)
      .where('status', 'PUBLISHED')
      .whereHas('recipients', (recipientQuery) => {
        recipientQuery.where('responsibleId', user.id)
      })
      .preload('creator')
      .preload('recipients', (recipientQuery) => {
        recipientQuery.where('responsibleId', user.id)
      })
      .first()

    if (!announcement) {
      throw AppException.notFound('Comunicado não encontrado')
    }

    const transformed = await serialize(SchoolAnnouncementTransformer.transform(announcement))
    const recipient = announcement.recipients[0] ?? null

    return response.ok({
      ...transformed,
      acknowledgementStatus: getRecipientAcknowledgementStatus({
        requiresAcknowledgement: announcement.requiresAcknowledgement,
        acknowledgedAt: recipient?.acknowledgedAt ?? null,
        acknowledgementDueAt: announcement.acknowledgementDueAt,
      }),
    })
  }
}
