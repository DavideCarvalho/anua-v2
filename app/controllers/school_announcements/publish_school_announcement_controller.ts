import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementRecipient from '#models/school_announcement_recipient'
import StudentHasResponsible from '#models/student_has_responsible'
import Notification from '#models/notification'
import SchoolAnnouncementTransformer from '#transformers/school_announcement_transformer'
import AppException from '#exceptions/app_exception'
import {
  AnnouncementAudienceValidationError,
  ensureAnnouncementAudienceIsSelected,
  resolveAnnouncementAudienceConfig,
  resolveAudienceStudentIds,
} from '#services/school_announcements/school_announcement_audience_service'

export default class PublishSchoolAnnouncementController {
  async handle({
    params,
    response,
    auth,
    effectiveUser,
    selectedSchoolIds,
    serialize,
  }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const announcement = await SchoolAnnouncement.query()
      .where('id', params.id)
      .preload('audiences')
      .first()
    if (!announcement) {
      throw AppException.notFound('Comunicado não encontrado')
    }

    if (!selectedSchoolIds || !selectedSchoolIds.includes(announcement.schoolId)) {
      throw AppException.forbidden('Sem permissão para publicar este comunicado')
    }

    if (announcement.status !== 'DRAFT') {
      throw AppException.badRequest('Comunicado já foi publicado')
    }

    const audienceConfig = resolveAnnouncementAudienceConfig(announcement.audiences)

    try {
      ensureAnnouncementAudienceIsSelected(audienceConfig)
    } catch (error) {
      if (error instanceof AnnouncementAudienceValidationError) {
        throw AppException.badRequest(error.message)
      }
      throw error
    }

    const audienceStudentIds = await resolveAudienceStudentIds(
      announcement.schoolId,
      audienceConfig
    )

    if (audienceStudentIds.length === 0) {
      throw AppException.badRequest('Nenhum aluno encontrado para o público selecionado')
    }

    const responsibleLinks = await StudentHasResponsible.query()
      .whereIn('studentId', audienceStudentIds)
      .select(['responsibleId'])

    const responsibleIds = [...new Set(responsibleLinks.map((link) => link.responsibleId))]

    const recipientRows = await db.transaction(async (trx) => {
      announcement.useTransaction(trx)
      announcement.status = 'PUBLISHED'
      announcement.publishedAt = DateTime.now()
      await announcement.save()

      const rows = await Promise.all(
        responsibleIds.map((responsibleId) =>
          SchoolAnnouncementRecipient.create(
            {
              announcementId: announcement.id,
              responsibleId,
              studentId: null,
              notificationId: null,
              acknowledgedAt: null,
            },
            { client: trx }
          )
        )
      )

      return rows
    })

    await Promise.all(
      recipientRows.map(async (recipient) => {
        const notification = await Notification.create({
          userId: recipient.responsibleId,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: announcement.title,
          message: announcement.body,
          data: {
            kind: 'school_announcement',
            announcementId: announcement.id,
          },
          isRead: false,
          sentViaInApp: true,
          sentViaEmail: false,
          sentViaPush: false,
          sentViaSms: false,
          sentViaWhatsApp: false,
          actionUrl: `/responsavel/comunicados?anuncio=${announcement.id}`,
        })

        recipient.notificationId = notification.id
        await recipient.save()
      })
    )

    await announcement.load('creator')
    await announcement.load('audiences')
    await announcement.load('recipients')

    return response.ok(await serialize(SchoolAnnouncementTransformer.transform(announcement)))
  }
}
