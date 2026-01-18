import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'

export default class ShowSchoolBySlugController {
  async handle({ params, response }: HttpContext) {
    const school = await School.query()
      .where('slug', params.slug)
      .preload('schoolChain')
      .preload('schoolGroups')
      .first()

    if (!school) {
      return response.notFound({ message: 'Escola não encontrada' })
    }

    return response.ok(school)
  }
}
