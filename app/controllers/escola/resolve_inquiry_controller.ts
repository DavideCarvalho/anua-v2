import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import { notifyInquiryResolved } from '#services/inquiries/inquiry_notification_service'

export default class ResolveInquiryController {
  async handle({
    response,
    auth,
    effectiveUser,
    selectedSchoolIds,
    params,
    serialize,
  }: HttpContext) {
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

    if (inquiry.status === 'RESOLVED' || inquiry.status === 'CLOSED') {
      throw AppException.badRequest('Esta pergunta já foi encerrada')
    }

    inquiry.status = 'RESOLVED'
    inquiry.resolvedAt = DateTime.now()
    inquiry.resolvedBy = user.id

    await inquiry.save()

    await inquiry.load('createdByResponsible')
    await inquiry.load('resolvedByUser')
    await inquiry.load('student')
    await inquiry.load('messages', (mq) => {
      mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
    })
    await inquiry.load('recipients', (rq) => rq.preload('user'))

    // Notify the responsible who created the inquiry
    if (inquiry.createdByResponsibleId) {
      await notifyInquiryResolved({
        inquiry,
        resolvedByName: user.name,
        notifyUserIds: [inquiry.createdByResponsibleId],
      })
    }

    return response.ok(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
