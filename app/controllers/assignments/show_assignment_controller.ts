import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'
import AppException from '#exceptions/app_exception'
import AssignmentTransformer from '#transformers/assignment_transformer'

export default class ShowAssignmentController {
  async handle({ params, response, serialize }: HttpContext) {
    const { id } = params

    const assignment = await Assignment.query()
      .where('id', id)
      .preload('teacherHasClass', (query) => {
        query.preload('class')
        query.preload('subject')
        query.preload('teacher')
      })
      .preload('submissions', (query) => {
        query.preload('student')
      })
      .first()

    if (!assignment) {
      throw AppException.notFound('Atividade não encontrada')
    }

    return response.ok(await serialize(AssignmentTransformer.transform(assignment)))
  }
}
