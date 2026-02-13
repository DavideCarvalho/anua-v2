import type { HttpContext } from '@adonisjs/core/http'
import Exam from '#models/exam'
import AppException from '#exceptions/app_exception'

export default class DeleteExamController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const exam = await Exam.find(id)

    if (!exam) {
      throw AppException.notFound('Prova não encontrada')
    }

    await exam.delete()

    return response.noContent()
  }
}
