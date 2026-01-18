import type { HttpContext } from '@adonisjs/core/http'
import SchoolGroup from '#models/school_group'

export default class ShowSchoolGroupController {
  async handle({ params, response }: HttpContext) {
    const schoolGroup = await SchoolGroup.query()
      .where('id', params.id)
      .preload('schoolChain')
      .preload('schools')
      .first()

    if (!schoolGroup) {
      return response.notFound({ message: 'Grupo escolar não encontrado' })
    }

    return response.ok(schoolGroup)
  }
}
