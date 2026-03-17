import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import ClassTransformer from '#transformers/class_transformer'
import AppException from '#exceptions/app_exception'

export default class ShowClassBySlugController {
  async handle({ params, response, serialize }: HttpContext) {
    const classEntity = await Class_.query()
      .where('slug', params.slug)
      .preload('level')
      .preload('students')
      .preload('teachers')
      .first()

    if (!classEntity) {
      throw AppException.notFound('Turma não encontrada')
    }

    return response.ok(await serialize(ClassTransformer.transform(classEntity)))
  }
}
