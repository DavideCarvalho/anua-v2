import type { HttpContext } from '@adonisjs/core/http'
import { saveExamGradeValidator } from '#validators/exam'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import AppException from '#exceptions/app_exception'

export default class UpdateExamGradeController {
  async handle({ params, request, response }: HttpContext) {
    const { id, gradeId } = params
    const payload = await request.validateUsing(saveExamGradeValidator)

    const exam = await Exam.find(id)

    if (!exam) {
      throw AppException.notFound('Prova não encontrada')
    }

    const grade = await ExamGrade.query().where('id', gradeId).where('examId', id).first()

    if (!grade) {
      throw AppException.notFound('Nota da prova não encontrada')
    }

    grade.merge({
      studentId: payload.studentId,
      score: payload.score,
      feedback: payload.feedback,
      // Validator provides absent (true = absent), model has attended (true = attended)
      attended: payload.absent !== true,
    })

    await grade.save()

    await grade.load('student')
    await grade.load('exam')

    return response.ok(grade)
  }
}
