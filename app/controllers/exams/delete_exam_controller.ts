import type { HttpContext } from '@adonisjs/core/http'
import Exam from '#models/exam'

export default class DeleteExamController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const exam = await Exam.find(id)

    if (!exam) {
      return response.notFound({ message: 'Exam not found' })
    }

    await exam.delete()

    return response.noContent()
  }
}
