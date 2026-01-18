import type { HttpContext } from '@adonisjs/core/http'
import Subject from '#models/subject'

export default class DeleteSubjectController {
  async handle({ params, response }: HttpContext) {
    const subject = await Subject.find(params.id)

    if (!subject) {
      return response.notFound({ message: 'Disciplina não encontrada' })
    }

    await subject.delete()

    return response.noContent()
  }
}
