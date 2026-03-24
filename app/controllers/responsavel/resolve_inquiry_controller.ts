import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import StudentHasResponsible from '#models/student_has_responsible'

export default class ResolveInquiryController {
  async handle({ response, auth, effectiveUser, params, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { inquiryId } = params

    const inquiry = await ParentInquiry.query().where('id', inquiryId).preload('student').first()

    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    const responsibleLink = await StudentHasResponsible.query()
      .where('studentId', inquiry.studentId)
      .where('responsibleId', user.id)
      .first()

    if (!responsibleLink) {
      throw AppException.forbidden('Você não tem permissão para encerrar esta pergunta')
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
    await inquiry.load('messages', (mq) => {
      mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
    })
    await inquiry.load('recipients', (rq) => rq.preload('user'))

    return response.ok(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
