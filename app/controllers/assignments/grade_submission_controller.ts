import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'
import StudentHasAssignment from '#models/student_has_assignment'
import StudentHasAssignmentDto from '#models/dto/student_has_assignment.dto'
import { gradeSubmissionValidator } from '#validators/assignment'
import AppException from '#exceptions/app_exception'
import { gamificationEventService } from '#services/gamification/gamification_event_service'

export default class GradeSubmissionController {
  async handle({ params, request, response, logger }: HttpContext) {
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

    // Trigger gamification event for grade
    if (payload.grade !== null && payload.grade !== undefined && assignment.grade !== null) {
      gamificationEventService
        .emitGradeReceived({
          gradeId: submission.id,
          studentId: submission.studentId,
          value: payload.grade,
          maxValue: assignment.grade,
          subjectId: assignment.teacherHasClassId,
          evaluationName: assignment.name,
        })
        .catch((err) => {
          logger.error({ err }, '[Gamification] Failed to emit grade event')
        })
    }

    return response.ok(new StudentHasAssignmentDto(submission))
  }
}
