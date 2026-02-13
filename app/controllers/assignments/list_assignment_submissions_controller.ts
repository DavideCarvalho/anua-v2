import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'
import StudentHasAssignment from '#models/student_has_assignment'
import StudentHasAssignmentDto from '#models/dto/student_has_assignment.dto'
import AppException from '#exceptions/app_exception'

export default class ListAssignmentSubmissionsController {
  async handle({ params, request }: HttpContext) {
    const { id } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const assignment = await Assignment.find(id)

    if (!assignment) {
      throw AppException.notFound('Atividade não encontrada')
    }

    const submissions = await StudentHasAssignment.query()
      .where('assignmentId', id)
      .preload('student')
      .orderBy('submittedAt', 'desc')
      .paginate(page, limit)

    return StudentHasAssignmentDto.fromPaginator(submissions)
  }
}
