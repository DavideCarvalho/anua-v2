import type { HttpContext } from '@adonisjs/core/http'
import Subject from '#models/subject'

export default class ShowSubjectBySlugController {
  async handle({ params, response }: HttpContext) {
    const subject = await Subject.query().where('slug', params.slug).preload('school').first()

    if (!subject) {
      return response.notFound({ message: 'Disciplina não encontrada' })
    }

    return response.ok(subject)
  }
}
