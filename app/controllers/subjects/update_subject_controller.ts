import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Subject from '#models/subject'
import { updateSubjectValidator } from '#validators/subject'
import AppException from '#exceptions/app_exception'
import SubjectTransformer from '#transformers/subject_transformer'

export default class UpdateSubjectController {
  async handle({ params, request, response, serialize }: HttpContext) {
    const subject = await Subject.find(params.id)

    if (!subject) {
      throw AppException.notFound('Disciplina não encontrada')
    }

    const data = await request.validateUsing(updateSubjectValidator)

    if (data.slug) {
      const existingSubject = await Subject.query()
        .where('slug', data.slug)
        .where('schoolId', subject.schoolId)
        .whereNot('id', subject.id)
        .first()

      if (existingSubject) {
        throw AppException.operationFailedWithProvidedData(409)
      }
    }

    const updatedSubject = await db.transaction(async (trx) => {
      subject.merge({
        name: data.name ?? subject.name,
        slug: data.slug ?? subject.slug,
        quantityNeededScheduled:
          data.quantityNeededScheduled !== undefined
            ? data.quantityNeededScheduled
            : subject.quantityNeededScheduled,
      })
      await subject.useTransaction(trx).save()
      return subject
    })

    return response.ok(await serialize(SubjectTransformer.transform(updatedSubject)))
  }
}
