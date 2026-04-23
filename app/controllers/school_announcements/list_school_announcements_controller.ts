import type { HttpContext } from '@adonisjs/core/http'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementTransformer from '#transformers/school_announcement_transformer'
import { listSchoolAnnouncementsValidator } from '#validators/school_announcement'
import AppException from '#exceptions/app_exception'

export default class ListSchoolAnnouncementsController {
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

    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      return response.ok({ data: [], metadata: { total: 0, page: 1, perPage: 20 } })
    }

    const {
      status,
      page = 1,
      limit = 20,
    } = await request.validateUsing(listSchoolAnnouncementsValidator)

    const query = SchoolAnnouncement.query().whereIn('schoolId', selectedSchoolIds)

    if (status) {
      query.where('status', status)
    }

    const list = await query
      .preload('creator')
      .preload('audiences')
      .preload('attachments', (attachmentQuery) => {
        attachmentQuery.orderBy('position', 'asc').orderBy('createdAt', 'asc')
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
    const data = list.all()
    const metadata = list.getMeta()

    return response.ok(await serialize(SchoolAnnouncementTransformer.paginate(data, metadata)))
  }
}
