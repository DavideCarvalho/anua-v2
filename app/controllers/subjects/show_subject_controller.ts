import type { HttpContext } from '@adonisjs/core/http'
import Subject from '#models/subject'

export default class ShowSubjectController {
  async handle({ params, response }: HttpContext) {
    const subject = await Subject.query()
      .where('id', params.id)
      .preload('school')
      .first()

    if (!subject) {
      return response.notFound({ message: 'Disciplina não encontrada' })
    }

    return response.ok(subject)
  }
}
