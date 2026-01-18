import type { HttpContext } from '@adonisjs/core/http'
import SchoolGroup from '#models/school_group'

export default class DeleteSchoolGroupController {
  async handle({ params, response }: HttpContext) {
    const schoolGroup = await SchoolGroup.find(params.id)

    if (!schoolGroup) {
      return response.notFound({ message: 'Grupo escolar não encontrado' })
    }

    await schoolGroup.delete()

    return response.noContent()
  }
}
