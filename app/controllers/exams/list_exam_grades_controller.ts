import type { HttpContext } from '@adonisjs/core/http'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import AppException from '#exceptions/app_exception'

export default class ListExamGradesController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const exam = await Exam.find(id)

    if (!exam) {
      throw AppException.notFound('Prova não encontrada')
    }

    const grades = await ExamGrade.query()
      .where('examId', id)
      .preload('student')
      .orderBy('createdAt', 'desc')

    return response.ok(grades)
  }
}
