import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Assignment from '#models/assignment'
import StudentHasAssignment from '#models/student_has_assignment'
import { submitAssignmentValidator } from '#validators/assignment'
import AppException from '#exceptions/app_exception'
import StudentHasAssignmentTransformer from '#transformers/student_has_assignment_transformer'

export default class SubmitAssignmentController {
  async handle({ params, request, response, serialize }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(submitAssignmentValidator)

    const assignment = await Assignment.find(id)

    if (!assignment) {
      throw AppException.notFound('Atividade não encontrada')
    }

    // Check if student already submitted
    const existingSubmission = await StudentHasAssignment.query()
      .where('assignmentId', id)
      .where('studentId', payload.studentId)
      .first()

    if (existingSubmission) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    const submission = await StudentHasAssignment.create({
      assignmentId: id,
      studentId: payload.studentId,
      submittedAt: DateTime.now(),
    })

    await submission.load('student')
    await submission.load('assignment')

    return response.created(await serialize(StudentHasAssignmentTransformer.transform(submission)))
  }
}
