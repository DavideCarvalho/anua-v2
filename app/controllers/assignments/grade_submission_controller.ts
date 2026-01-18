import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Assignment from '#models/assignment'
import AssignmentSubmission from '#models/assignment_submission'
import { gradeSubmissionValidator } from '#validators/assignment'

export default class GradeSubmissionController {
  async handle({ params, request, response }: HttpContext) {
    const { id, submissionId } = params
    const payload = await request.validateUsing(gradeSubmissionValidator)

    const assignment = await Assignment.find(id)

    if (!assignment) {
      return response.notFound({ message: 'Assignment not found' })
    }

    const submission = await AssignmentSubmission.query()
      .where('id', submissionId)
      .where('assignmentId', id)
      .first()

    if (!submission) {
      return response.notFound({ message: 'Submission not found' })
    }

    submission.merge({
      score: payload.score,
      feedback: payload.feedback,
      status: 'GRADED',
      gradedAt: DateTime.now(),
    })
    await submission.save()

    await submission.load('student')
    await submission.load('assignment')

    return response.ok(submission)
  }
}
