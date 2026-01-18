import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'

export default class ShowAssignmentController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const assignment = await Assignment.query()
      .where('id', id)
      .preload('class')
      .preload('subject')
      .preload('teacher')
      .preload('submissions', (query) => {
        query.preload('student')
      })
      .first()

    if (!assignment) {
      return response.notFound({ message: 'Assignment not found' })
    }

    return response.ok(assignment)
  }
}
