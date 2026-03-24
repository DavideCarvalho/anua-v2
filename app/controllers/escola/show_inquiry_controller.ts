import type { HttpContext } from '@adonisjs/core/http'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryRecipient from '#models/parent_inquiry_recipient'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'

export default class ShowInquiryController {
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
      .preload('student')
      .preload('createdByResponsible')
      .preload('resolvedByUser')
      .preload('messages', (mq) => {
        mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
      })
      .preload('recipients', (rq) => rq.preload('user'))
      .first()

    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    const recipient = await ParentInquiryRecipient.query()
      .where('inquiryId', inquiry.id)
      .where('userId', user.id)
      .first()

    if (!recipient) {
      throw AppException.forbidden('Você não tem permissão para visualizar esta pergunta')
    }

    return response.ok(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
