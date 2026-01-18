import type { HttpContext } from '@adonisjs/core/http'
import Subject from '#models/subject'
import { updateSubjectValidator } from '#validators/subject'

export default class UpdateSubjectController {
  async handle({ params, request, response }: HttpContext) {
    const subject = await Subject.find(params.id)

    if (!subject) {
      return response.notFound({ message: 'Disciplina não encontrada' })
    }

    const data = await request.validateUsing(updateSubjectValidator)

    if (data.slug) {
      const existingSubject = await Subject.query()
        .where('slug', data.slug)
        .where('schoolId', subject.schoolId)
        .whereNot('id', subject.id)
        .first()

      if (existingSubject) {
        return response.conflict({ message: 'Já existe uma disciplina com este slug nesta escola' })
      }
    }

    subject.merge(data)
    await subject.save()

    return response.ok(subject)
  }
}
