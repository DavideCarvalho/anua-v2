import type { HttpContext } from '@adonisjs/core/http'
import string from '@adonisjs/core/helpers/string'
import Subject from '#models/subject'
import { createSubjectValidator } from '#validators/subject'
import AppException from '#exceptions/app_exception'

export default class CreateSubjectController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createSubjectValidator)

    const slug = data.slug ?? string.slug(data.name)

    const existingSubject = await Subject.query()
      .where('slug', slug)
      .where('schoolId', data.schoolId)
      .first()

    if (existingSubject) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    const subject = await Subject.create({
      ...data,
      slug,
    })

    return response.created(subject)
  }
}
