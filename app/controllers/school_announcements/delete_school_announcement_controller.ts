import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import AppException from '#exceptions/app_exception'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementAudience from '#models/school_announcement_audience'
import SchoolAnnouncementRecipient from '#models/school_announcement_recipient'

export default class DeleteSchoolAnnouncementController {
  async handle({ params, response, auth, effectiveUser, selectedSchoolIds }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const announcement = await SchoolAnnouncement.find(params.id)
    if (!announcement) {
      throw AppException.notFound('Comunicado não encontrado')
    }

    if (!selectedSchoolIds || !selectedSchoolIds.includes(announcement.schoolId)) {
      throw AppException.forbidden('Sem permissão para excluir este comunicado')
    }

    if (announcement.status !== 'DRAFT') {
      throw AppException.badRequest('Somente comunicados em rascunho podem ser excluídos')
    }

    await db.transaction(async (trx) => {
      await SchoolAnnouncementAudience.query({ client: trx })
        .where('announcementId', announcement.id)
        .delete()

      await SchoolAnnouncementRecipient.query({ client: trx })
        .where('announcementId', announcement.id)
        .delete()

      announcement.useTransaction(trx)
      await announcement.delete()
    })

    return response.noContent()
  }
}
