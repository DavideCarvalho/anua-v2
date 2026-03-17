import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import AppException from '#exceptions/app_exception'
import SchoolTransformer from '#transformers/school_transformer'

export default class ShowSchoolBySlugController {
  async handle({ params, response, serialize }: HttpContext) {
    const school = await School.query()
      .where('slug', params.slug)
      .preload('schoolChain')
      .preload('schoolGroups')
      .first()

    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    return response.ok(await serialize(SchoolTransformer.transform(school)))
  }
}
