import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'
import StudentHasAssignment from '#models/student_has_assignment'
import StudentHasAssignmentTransformer from '#transformers/student_has_assignment_transformer'
import AppException from '#exceptions/app_exception'

export default class ListAssignmentSubmissionsController {
  async handle({ params, request, serialize }: HttpContext) {
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

    const data = submissions.all()
    const metadata = submissions.getMeta()

    return serialize(StudentHasAssignmentTransformer.paginate(data, metadata))
  }
}
