import type { HttpContext } from '@adonisjs/core/http'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import StudentHasResponsible from '#models/student_has_responsible'
import { listInquiriesValidator } from '#validators/parent_inquiry'

export default class ListStudentInquiriesController {
  async handle({ request, response, auth, effectiveUser, params, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { studentId } = params

    const responsibleLink = await StudentHasResponsible.query()
      .where('studentId', studentId)
      .where('responsibleId', user.id)
      .first()

    if (!responsibleLink) {
      throw AppException.forbidden('Você não é responsável por este aluno')
    }

    const payload = await request.validateUsing(listInquiriesValidator)
    const page = payload.page || 1
    const limit = Math.min(payload.limit || 20, 100)

    const query = ParentInquiry.query()
      .where('studentId', studentId)
      .preload('createdByResponsible')
      .preload('readStatuses', (rq) => rq.where('userId', user.id))
      .preload('messages', (mq) => {
        mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
      })

    if (payload.status && payload.status !== 'ALL') {
      query.where('status', payload.status)
    }

    const result = await query.orderBy('createdAt', 'desc').paginate(page, limit)
    const data = result.all()
    const metadata = result.getMeta()

    return response.ok(await serialize(ParentInquiryTransformer.paginate(data, metadata)))
  }
}
