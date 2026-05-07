import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementRecipient from '#models/school_announcement_recipient'
import StudentHasResponsible from '#models/student_has_responsible'
import Notification from '#models/notification'
import User from '#models/user'
import School from '#models/school'
import Student from '#models/student'
import SchoolAnnouncementTransformer from '#transformers/school_announcement_transformer'
import SchoolAnnouncementMail from '#mails/school_announcement_mail'
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

    const school = await School.findOrFail(announcement.schoolId)

    // Responsible users from StudentHasResponsible (parents/guardians)
    const responsibleLinks = await StudentHasResponsible.query()
      .whereIn('studentId', audienceStudentIds)
      .select(['responsibleId'])

    const responsibleIds = new Set(responsibleLinks.map((link) => link.responsibleId))

    // Self-responsible students (isSelfResponsible = true) are their own responsible
    const selfResponsibleStudents = await Student.query()
      .whereIn('id', audienceStudentIds)
      .where('isSelfResponsible', true)
      .select('id')

    for (const student of selfResponsibleStudents) {
      responsibleIds.add(student.id)
    }

    const responsibleIdList = [...responsibleIds]
    const hasRecipients = responsibleIdList.length > 0

    if (hasRecipients) {
      const responsibleUsers = await User.query()
        .whereIn('id', responsibleIdList)
        .select(['id', 'name', 'email'])

      const responsibleUserMap = new Map(responsibleUsers.map((u) => [u.id, u]))

      await db.transaction(async (trx) => {
        announcement.useTransaction(trx)
        announcement.status = 'PUBLISHED'
        announcement.publishedAt = DateTime.now()
        await announcement.save()

        const rows = await Promise.all(
          responsibleIdList.map((responsibleId) =>
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

        for (const recipient of rows) {
          const actionUrl = `/responsavel/comunicados?anuncio=${announcement.id}`
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
            sentViaEmail: true,
            sentViaPush: false,
            sentViaSms: false,
            sentViaWhatsApp: false,
            actionUrl,
          })

          recipient.notificationId = notification.id
          await recipient.save()

          const recipientUser = responsibleUserMap.get(recipient.responsibleId)
          if (recipientUser?.email) {
            try {
              await mail.sendLater(
                new SchoolAnnouncementMail(
                  recipientUser,
                  school.name,
                  announcement.title,
                  announcement.body,
                  actionUrl
                )
              )
            } catch (error) {
              notification.emailError =
                error instanceof Error ? error.message : 'Erro ao enviar email'
              await notification.save()
            }
          }
        }
      })
    } else {
      announcement.status = 'PUBLISHED'
      announcement.publishedAt = DateTime.now()
      await announcement.save()
    }

    await announcement.load('creator')
    await announcement.load('audiences')
    await announcement.load('recipients')

    return response.ok(await serialize(SchoolAnnouncementTransformer.transform(announcement)))
  }
}
