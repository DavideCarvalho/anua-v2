import type { HttpContext } from '@adonisjs/core/http'
import SchoolGroup from '#models/school_group'
import SchoolGroupDto from '#models/dto/school_group.dto'
import AppException from '#exceptions/app_exception'

export default class ShowSchoolGroupController {
  async handle({ params, response }: HttpContext) {
    const schoolGroup = await SchoolGroup.query()
      .where('id', params.id)
      .preload('schoolChain')
      .preload('schools')
      .first()

    if (!schoolGroup) {
      throw AppException.notFound('Grupo escolar não encontrado')
    }

    return response.ok(new SchoolGroupDto(schoolGroup))
  }
}
