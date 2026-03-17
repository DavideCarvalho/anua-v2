import type { HttpContext } from '@adonisjs/core/http'
import Subject from '#models/subject'
import AppException from '#exceptions/app_exception'
import SubjectTransformer from '#transformers/subject_transformer'

export default class ShowSubjectBySlugController {
  async handle({ params, response, serialize }: HttpContext) {
    const subject = await Subject.query().where('slug', params.slug).preload('school').first()

    if (!subject) {
      throw AppException.notFound('Disciplina não encontrada')
    }

    return response.ok(await serialize(SubjectTransformer.transform(subject)))
  }
}
