import type { HttpContext } from '@adonisjs/core/http'
import Exam from '#models/exam'

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
      return response.notFound({ message: 'Exam not found' })
    }

    return response.ok(exam)
  }
}
