import type { HttpContext } from '@adonisjs/core/http'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryRecipient from '#models/parent_inquiry_recipient'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import { listInquiriesValidator } from '#validators/parent_inquiry'

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

    const recipientInquiries = await ParentInquiryRecipient.query()
      .where('userId', user.id)
      .select('inquiryId')

    const inquiryIds = recipientInquiries.map((r) => r.inquiryId)

    if (inquiryIds.length === 0) {
      return response.ok(
        await serialize(
          ParentInquiryTransformer.paginate([], {
            total: 0,
            per_page: limit,
            current_page: page,
            last_page: 1,
            first_page: 1,
            first_page_url: null,
            last_page_url: null,
            next_page_url: null,
            previous_page_url: null,
          })
        )
      )
    }

    const query = ParentInquiry.query()
      .whereIn('id', inquiryIds)
      .whereIn('schoolId', scopedSchoolIds)
      .preload('student')
      .preload('createdByResponsible')
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
