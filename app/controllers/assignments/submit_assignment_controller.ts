import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Assignment from '#models/assignment'
import AssignmentSubmission from '#models/assignment_submission'
import { submitAssignmentValidator } from '#validators/assignment'

export default class SubmitAssignmentController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(submitAssignmentValidator)

    const assignment = await Assignment.find(id)

    if (!assignment) {
      return response.notFound({ message: 'Assignment not found' })
    }

    const now = DateTime.now()
    const isLate = now > assignment.dueDate

    const submission = await AssignmentSubmission.create({
      assignmentId: id,
      studentId: payload.studentId,
      content: payload.content,
      attachmentUrl: payload.attachmentUrl,
      status: isLate ? 'LATE' : 'SUBMITTED',
      submittedAt: now,
    })

    await submission.load('student')
    await submission.load('assignment')

    return response.created(submission)
  }
}
