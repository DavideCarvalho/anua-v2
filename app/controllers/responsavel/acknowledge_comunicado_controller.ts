import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementRecipient from '#models/school_announcement_recipient'
import AppException from '#exceptions/app_exception'

export default class AcknowledgeComunicadoController {
  async handle({ params, response, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const announcement = await SchoolAnnouncement.query()
      .where('id', params.id)
      .where('status', 'PUBLISHED')
      .first()

    if (!announcement) {
      throw AppException.notFound('Comunicado não encontrado')
    }

    if (!announcement.requiresAcknowledgement) {
      throw AppException.badRequest('Este comunicado não exige ciência')
    }

    const recipient = await SchoolAnnouncementRecipient.query()
      .where('announcementId', announcement.id)
      .where('responsibleId', user.id)
      .first()

    if (!recipient) {
      throw AppException.notFound('Comunicado não encontrado para este responsável')
    }

    if (!recipient.acknowledgedAt) {
      recipient.acknowledgedAt = DateTime.now()
      await recipient.save()
    }

    return response.ok({
      announcementId: announcement.id,
      acknowledgedAt: recipient.acknowledgedAt,
    })
  }
}
