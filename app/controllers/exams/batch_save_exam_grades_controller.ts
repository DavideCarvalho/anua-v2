import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { batchSaveExamGradesValidator } from '#validators/exam'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'

export default class BatchSaveExamGradesController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(batchSaveExamGradesValidator)

    const exam = await Exam.find(id)

    if (!exam) {
      return response.notFound({ message: 'Exam not found' })
    }

    const results = []

    for (const gradeData of payload.grades) {
      // Find or create the exam grade
      let grade = await ExamGrade.query()
        .where('studentId', gradeData.studentId)
        .where('examId', id)
        .first()

      if (grade) {
        // Update existing grade
        grade.merge({
          score: gradeData.score,
          feedback: gradeData.feedback,
          attended: gradeData.absent !== true,
          gradedAt: DateTime.now(),
        })
        await grade.save()
      } else {
        // Create new grade
        grade = await ExamGrade.create({
          examId: id,
          studentId: gradeData.studentId,
          score: gradeData.score,
          feedback: gradeData.feedback,
          attended: gradeData.absent !== true,
          gradedAt: DateTime.now(),
        })
      }

      results.push(grade)
    }

    return response.ok({
      message: 'Notas salvas com sucesso',
      count: results.length,
    })
  }
}
