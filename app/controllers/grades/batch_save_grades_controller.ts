import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Assignment from '#models/assignment'
import StudentHasAssignment from '#models/student_has_assignment'
import { batchSaveGradesValidator } from '#validators/grades'
import AppException from '#exceptions/app_exception'
import { gamificationEventService } from '#services/gamification/gamification_event_service'

export default class BatchSaveGradesController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(batchSaveGradesValidator)

    const assignment = await Assignment.find(payload.assignmentId)
    if (!assignment) {
      throw AppException.notFound('Atividade não encontrada')
    }

    const results = []

    for (const gradeData of payload.grades) {
      // Skip if grade is null (student didn't submit)
      if (gradeData.grade === null) continue

      // Find or create the student submission
      let submission = await StudentHasAssignment.query()
        .where('studentId', gradeData.studentId)
        .where('assignmentId', payload.assignmentId)
        .first()

      if (submission) {
        // Update existing submission
        submission.grade = gradeData.grade
        if (gradeData.submittedAt) {
          submission.submittedAt = DateTime.fromISO(gradeData.submittedAt)
        }
        await submission.save()
      } else {
        // Create new submission
        submission = await StudentHasAssignment.create({
          studentId: gradeData.studentId,
          assignmentId: payload.assignmentId,
          grade: gradeData.grade,
          submittedAt: gradeData.submittedAt
            ? DateTime.fromISO(gradeData.submittedAt)
            : DateTime.now(),
        })
      }

      results.push(submission)
    }

    for (const submission of results) {
      gamificationEventService
        .emitGradeReceived({
          gradeId: submission.id,
          studentId: submission.studentId,
          value: Number(submission.grade),
          maxValue: 10,
        })
        .catch(() => {})
    }

    return response.ok({
      message: 'Notas salvas com sucesso',
      count: results.length,
    })
  }
}
