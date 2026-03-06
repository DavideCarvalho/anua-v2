import type { HttpContext } from '@adonisjs/core/http'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementTransformer from '#transformers/school_announcement_transformer'
import AppException from '#exceptions/app_exception'

export default class ShowSchoolAnnouncementController {
  async handle({
    params,
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

    const announcement = await SchoolAnnouncement.query()
      .where('id', params.id)
      .preload('creator')
      .preload('audiences')
      .preload('recipients')
      .first()
    if (!announcement) {
      throw AppException.notFound('Comunicado não encontrado')
    }

    if (!selectedSchoolIds || !selectedSchoolIds.includes(announcement.schoolId)) {
      throw AppException.forbidden('Sem permissão para visualizar este comunicado')
    }

    return response.ok(await serialize(SchoolAnnouncementTransformer.transform(announcement)))
  }
}
