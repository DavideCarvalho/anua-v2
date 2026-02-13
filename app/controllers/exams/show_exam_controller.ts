import type { HttpContext } from '@adonisjs/core/http'
import Exam from '#models/exam'
import AppException from '#exceptions/app_exception'

export default class ShowExamController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const exam = await Exam.query()
      .where('id', id)
      .preload('class')
      .preload('subject')
      .preload('teacher')
      .preload('grades', (gradesQuery) => {
        gradesQuery.preload('student')
      })
      .first()

    if (!exam) {
      throw AppException.notFound('Prova não encontrada')
    }

    return response.ok(exam)
  }
}
