import type { HttpContext } from '@adonisjs/core/http'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryReadStatus from '#models/parent_inquiry_read_status'
import AppException from '#exceptions/app_exception'
import { DateTime } from 'luxon'
import { getInquiryActorTypeForUser } from '#services/inquiries/inquiry_school_access_service'

export default class MarkInquiryReadController {
  async handle({ params, auth, effectiveUser, selectedSchoolIds, response }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const scopedSchoolIds = selectedSchoolIds ?? []
    const { inquiryId } = params

    const inquiry = await ParentInquiry.query()
      .where('id', inquiryId)
      .whereIn('schoolId', scopedSchoolIds)
      .first()

    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    const actorType = await getInquiryActorTypeForUser(inquiry, user.id)
    if (!actorType) {
      throw AppException.forbidden('Você não tem permissão para visualizar esta pergunta')
    }

    await ParentInquiryReadStatus.updateOrCreate(
      { userId: user.id, inquiryId: inquiry.id },
      { lastReadAt: DateTime.now() }
    )

    return response.noContent()
  }
}
