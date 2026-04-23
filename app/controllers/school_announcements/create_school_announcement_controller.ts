import type { HttpContext } from '@adonisjs/core/http'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import { attachmentManager } from '@jrmc/adonis-attachment'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementAttachment from '#models/school_announcement_attachment'
import SchoolAnnouncementTransformer from '#transformers/school_announcement_transformer'
import { createSchoolAnnouncementValidator } from '#validators/school_announcement'
import {
  AnnouncementAudienceValidationError,
  syncSchoolAnnouncementAudience,
} from '#services/school_announcements/school_announcement_audience_service'
import AppException from '#exceptions/app_exception'

export default class CreateSchoolAnnouncementController {
  async handle({
    request,
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

    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      throw AppException.forbidden('Nenhuma escola selecionada')
    }

    const payload = await request.validateUsing(createSchoolAnnouncementValidator)
    const attachments = (payload.attachments ?? []) as MultipartFile[]

    const requiresAcknowledgement = payload.requiresAcknowledgement ?? false
    const acknowledgementDueAt =
      requiresAcknowledgement && payload.acknowledgementDueAt
        ? DateTime.fromJSDate(payload.acknowledgementDueAt)
        : null

    let announcement: SchoolAnnouncement

    try {
      announcement = await db.transaction(async (trx) => {
        const created = await SchoolAnnouncement.create(
          {
            schoolId: selectedSchoolIds[0],
            title: payload.title,
            body: payload.body,
            status: 'DRAFT',
            publishedAt: null,
            requiresAcknowledgement,
            acknowledgementDueAt,
            createdByUserId: user.id,
          },
          { client: trx }
        )

        await syncSchoolAnnouncementAudience(trx, created.id, created.schoolId, {
          audienceAcademicPeriodIds: payload.audienceAcademicPeriodIds,
          audienceCourseIds: payload.audienceCourseIds,
          audienceLevelIds: payload.audienceLevelIds,
          audienceClassIds: payload.audienceClassIds,
          audienceStudentIds: payload.audienceStudentIds,
        })

        for (const [index, file] of attachments.entries()) {
          const attachment = await SchoolAnnouncementAttachment.create(
            {
              announcementId: created.id,
              fileName: file.clientName,
              filePath: '',
              mimeType: file.type ?? 'application/octet-stream',
              fileSizeBytes: file.size,
              position: index,
            },
            { client: trx }
          )

          attachment.file = await attachmentManager.createFromFile(file)
          attachment.filePath = attachment.file?.name ?? ''
          attachment.useTransaction(trx)
          await attachment.save()
        }

        return created
      })
    } catch (error) {
      if (error instanceof AnnouncementAudienceValidationError) {
        throw AppException.badRequest(error.message)
      }

      throw error
    }

    await announcement.load('creator')
    await announcement.load('audiences')
    await announcement.load('attachments')

    return response.created(await serialize(SchoolAnnouncementTransformer.transform(announcement)))
  }
}
