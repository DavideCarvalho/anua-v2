import type { HttpContext } from '@adonisjs/core/http'
import SchoolGroup from '#models/school_group'
import AppException from '#exceptions/app_exception'

export default class DeleteSchoolGroupController {
  async handle({ params, response }: HttpContext) {
    const schoolGroup = await SchoolGroup.find(params.id)

    if (!schoolGroup) {
      throw AppException.notFound('Grupo escolar não encontrado')
    }

    await schoolGroup.delete()

    return response.noContent()
  }
}
