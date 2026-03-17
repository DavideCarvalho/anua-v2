import type { HttpContext } from '@adonisjs/core/http'
import SchoolGroup from '#models/school_group'
import AppException from '#exceptions/app_exception'
import SchoolGroupTransformer from '#transformers/school_group_transformer'

export default class ShowSchoolGroupController {
  async handle({ params, response, serialize }: HttpContext) {
    const schoolGroup = await SchoolGroup.query()
      .where('id', params.id)
      .preload('schoolChain')
      .preload('schools')
      .first()

    if (!schoolGroup) {
      throw AppException.notFound('Grupo escolar não encontrado')
    }

    return response.ok(await serialize(SchoolGroupTransformer.transform(schoolGroup)))
  }
}
