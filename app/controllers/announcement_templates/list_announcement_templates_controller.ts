import type { HttpContext } from '@adonisjs/core/http'
import AnnouncementTemplate from '#models/announcement_template'

export default class ListAnnouncementTemplatesController {
  async handle({ selectedSchoolIds }: HttpContext) {
    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      return { data: [] }
    }

    const templates = await AnnouncementTemplate.query()
      .whereIn('schoolId', selectedSchoolIds)
      .orderBy('name', 'asc')

    return {
      data: templates.map((t) => ({
        id: t.id,
        name: t.name,
        title: t.title,
        body: t.body,
        createdAt: t.createdAt.toISO(),
      })),
    }
  }
}
