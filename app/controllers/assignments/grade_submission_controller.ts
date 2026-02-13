import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'
import StudentHasAssignment from '#models/student_has_assignment'
import { gradeSubmissionValidator } from '#validators/assignment'
import AppException from '#exceptions/app_exception'

export default class GradeSubmissionController {
  async handle({ params, request, response }: HttpContext) {
    const { id, submissionId } = params
    const payload = await request.validateUsing(gradeSubmissionValidator)

    const assignment = await Assignment.find(id)

    if (!assignment) {
      throw AppException.notFound('Atividade não encontrada')
    }

    const submission = await StudentHasAssignment.query()
      .where('id', submissionId)
      .where('assignmentId', id)
      .first()

    if (!submission) {
      throw AppException.notFound('Entrega não encontrada')
    }

    submission.grade = payload.grade
    await submission.save()

    await submission.load('student')
    await submission.load('assignment')

    return response.ok(submission)
  }
}
