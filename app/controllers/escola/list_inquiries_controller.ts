import type { HttpContext } from '@adonisjs/core/http'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import { listInquiriesValidator } from '#validators/parent_inquiry'
import { listAccessibleInquiryIdsForUser } from '#services/inquiries/inquiry_school_access_service'

export default class ListInquiriesController {
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

    const scopedSchoolIds = selectedSchoolIds ?? []

    const payload = await request.validateUsing(listInquiriesValidator)
    const page = payload.page || 1
    const limit = Math.min(payload.limit || 20, 100)

    const inquiryIds = await listAccessibleInquiryIdsForUser(user.id, scopedSchoolIds)

    if (inquiryIds.length === 0) {
      const emptyResult = await ParentInquiry.query().whereRaw('1 = 0').paginate(page, limit)
      return response.ok(
        await serialize(ParentInquiryTransformer.paginate(emptyResult.all(), emptyResult.getMeta()))
      )
    }

    const query = ParentInquiry.query()
      .whereIn('id', inquiryIds)
      .whereIn('schoolId', scopedSchoolIds)
      .preload('student')
      .preload('createdByResponsible')
      .preload('readStatuses', (rq) => rq.where('userId', user.id))
      .preload('messages', (mq) => {
        mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
      })

    if (payload.status && payload.status !== 'ALL') {
      query.where('status', payload.status)
    }

    const result = await query.orderBy('updatedAt', 'desc').paginate(page, limit)

    return response.ok(
      await serialize(ParentInquiryTransformer.paginate(result.all(), result.getMeta()))
    )
  }
}
