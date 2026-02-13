import type { HttpContext } from '@adonisjs/core/http'
import Subject from '#models/subject'
import AppException from '#exceptions/app_exception'

export default class DeleteSubjectController {
  async handle({ params, response }: HttpContext) {
    const subject = await Subject.find(params.id)

    if (!subject) {
      throw AppException.notFound('Disciplina não encontrada')
    }

    await subject.delete()

    return response.noContent()
  }
}
