import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import AnnouncementTemplate from '#models/announcement_template'
import AppException from '#exceptions/app_exception'

const validator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(100),
    title: vine.string().trim().maxLength(200),
    body: vine.string().trim().maxLength(5000),
  })
)

export default class CreateAnnouncementTemplateController {
  async handle({ request, selectedSchoolIds, auth }: HttpContext) {
    const payload = await request.validateUsing(validator)

    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      throw AppException.badRequest('Nenhuma escola selecionada')
    }

    const template = await AnnouncementTemplate.create({
      schoolId: selectedSchoolIds[0],
      name: payload.name,
      title: payload.title,
      body: payload.body,
      createdById: auth.user?.id ?? null,
    })

    return {
      id: template.id,
      name: template.name,
      title: template.title,
      body: template.body,
      createdAt: template.createdAt.toISO(),
    }
  }
}
