import type { HttpContext } from '@adonisjs/core/http'
import AnnouncementTemplate from '#models/announcement_template'
import AppException from '#exceptions/app_exception'

export default class DeleteAnnouncementTemplateController {
  async handle({ params, selectedSchoolIds, response }: HttpContext) {
    const template = await AnnouncementTemplate.find(params.id)

    if (!template) {
      throw AppException.notFound('Template não encontrado')
    }

    if (!selectedSchoolIds?.includes(template.schoolId)) {
      throw AppException.forbidden('Sem permissão para excluir este template')
    }

    await template.delete()
    return response.noContent()
  }
}
