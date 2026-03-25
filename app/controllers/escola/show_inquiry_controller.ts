import type { HttpContext } from '@adonisjs/core/http'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import { getInquiryActorTypeForUser } from '#services/inquiries/inquiry_school_access_service'

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

    const actorType = await getInquiryActorTypeForUser(inquiry, user.id)
    if (!actorType) {
      throw AppException.forbidden('Você não tem permissão para visualizar esta pergunta')
    }

    return response.ok(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
