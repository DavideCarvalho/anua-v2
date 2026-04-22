import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementTransformer from '#transformers/school_announcement_transformer'
import { updateSchoolAnnouncementValidator } from '#validators/school_announcement'
import {
  AnnouncementAudienceValidationError,
  resolveAnnouncementAudienceConfig,
  syncSchoolAnnouncementAudience,
} from '#services/school_announcements/school_announcement_audience_service'
import AppException from '#exceptions/app_exception'

export default class UpdateSchoolAnnouncementController {
  async handle({
    params,
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

    const announcement = await SchoolAnnouncement.query()
      .where('id', params.id)
      .preload('audiences')
      .first()
    if (!announcement) {
      throw AppException.notFound('Comunicado não encontrado')
    }

    if (!selectedSchoolIds || !selectedSchoolIds.includes(announcement.schoolId)) {
      throw AppException.forbidden('Sem permissão para editar este comunicado')
    }

    if (announcement.status !== 'DRAFT') {
      throw AppException.badRequest('Somente comunicados em rascunho podem ser editados')
    }

    const payload = await request.validateUsing(updateSchoolAnnouncementValidator)

    const announcementAudience = resolveAnnouncementAudienceConfig(announcement.audiences)
    const hasAudienceUpdate =
      payload.audienceAcademicPeriodIds !== undefined ||
      payload.audienceCourseIds !== undefined ||
      payload.audienceLevelIds !== undefined ||
      payload.audienceClassIds !== undefined ||
      payload.audienceStudentIds !== undefined
    const requiresAcknowledgement =
      payload.requiresAcknowledgement ?? announcement.requiresAcknowledgement
    const hasAckDueAtUpdate = payload.acknowledgementDueAt !== undefined
    const acknowledgementDueAt = !requiresAcknowledgement
      ? null
      : hasAckDueAtUpdate
        ? payload.acknowledgementDueAt
          ? DateTime.fromJSDate(payload.acknowledgementDueAt)
          : null
        : announcement.acknowledgementDueAt

    try {
      await db.transaction(async (trx) => {
        announcement.useTransaction(trx)
        announcement.merge({
          title: payload.title ?? announcement.title,
          body: payload.body ?? announcement.body,
          requiresAcknowledgement,
          acknowledgementDueAt,
        })

        await announcement.save()

        if (hasAudienceUpdate) {
          await syncSchoolAnnouncementAudience(trx, announcement.id, announcement.schoolId, {
            audienceAcademicPeriodIds:
              payload.audienceAcademicPeriodIds ?? announcementAudience.audienceAcademicPeriodIds,
            audienceCourseIds: payload.audienceCourseIds ?? announcementAudience.audienceCourseIds,
            audienceLevelIds: payload.audienceLevelIds ?? announcementAudience.audienceLevelIds,
            audienceClassIds: payload.audienceClassIds ?? announcementAudience.audienceClassIds,
            audienceStudentIds:
              payload.audienceStudentIds ?? announcementAudience.audienceStudentIds,
          })
        }
      })
    } catch (error) {
      if (error instanceof AnnouncementAudienceValidationError) {
        throw AppException.badRequest(error.message)
      }

      throw error
    }

    await announcement.load('creator')
    await announcement.load('audiences')

    return response.ok(await serialize(SchoolAnnouncementTransformer.transform(announcement)))
  }
}
