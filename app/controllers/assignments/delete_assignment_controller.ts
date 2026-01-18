import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'

export default class DeleteAssignmentController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const assignment = await Assignment.find(id)

    if (!assignment) {
      return response.notFound({ message: 'Assignment not found' })
    }

    await assignment.delete()

    return response.noContent()
  }
}
