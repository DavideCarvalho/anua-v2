import type { HttpContext } from '@adonisjs/core/http'
import Scholarship from '#models/scholarship'
import AppException from '#exceptions/app_exception'
import ScholarshipTransformer from '#transformers/scholarship_transformer'

export default class ShowScholarshipController {
  async handle({ params, response, serialize }: HttpContext) {
    const scholarship = await Scholarship.query().where('id', params.id).first()

    if (!scholarship) {
      throw AppException.notFound('Bolsa não encontrada')
    }

    return response.ok(await serialize(ScholarshipTransformer.transform(scholarship)))
  }
}
