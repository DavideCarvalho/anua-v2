import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'
import StudentHasAssignment from '#models/student_has_assignment'
import { gradeSubmissionValidator } from '#validators/assignment'

export default class GradeSubmissionController {
  async handle({ params, request, response }: HttpContext) {
    const { id, submissionId } = params
    const payload = await request.validateUsing(gradeSubmissionValidator)

    const assignment = await Assignment.find(id)

    if (!assignment) {
      return response.notFound({ message: 'Assignment not found' })
    }

    const submission = await StudentHasAssignment.query()
      .where('id', submissionId)
      .where('assignmentId', id)
      .first()

    if (!submission) {
      return response.notFound({ message: 'Submission not found' })
    }

    submission.grade = payload.grade
    await submission.save()

    await submission.load('student')
    await submission.load('assignment')

    return response.ok(submission)
  }
}
