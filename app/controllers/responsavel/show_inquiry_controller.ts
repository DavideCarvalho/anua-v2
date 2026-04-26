import type { HttpContext } from '@adonisjs/core/http'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import StudentHasResponsible from '#models/student_has_responsible'

export default class ShowInquiryController {
  async handle({ response, auth, effectiveUser, params, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { inquiryId } = params

    const inquiry = await ParentInquiry.query()
      .where('id', inquiryId)
      .preload('student')
      .preload('createdByResponsible')
      .preload('resolvedByUser')
      .preload('readStatuses', (rq) => rq.where('userId', user.id))
      .preload('messages', (mq) => {
        mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
      })
      .preload('recipients', (rq) => rq.preload('user'))
      .first()

    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    const responsibleLink = await StudentHasResponsible.query()
      .where('studentId', inquiry.studentId)
      .where('responsibleId', user.id)
      .first()

    if (!responsibleLink) {
      throw AppException.forbidden('Você não tem permissão para visualizar esta pergunta')
    }

    return response.ok(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
