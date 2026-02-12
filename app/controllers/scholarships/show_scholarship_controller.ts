import type { HttpContext } from '@adonisjs/core/http'
import Scholarship from '#models/scholarship'
import AppException from '#exceptions/app_exception'

export default class ShowScholarshipController {
  async handle({ params, response }: HttpContext) {
    const scholarship = await Scholarship.query().where('id', params.id).first()

    if (!scholarship) {
      throw AppException.notFound('Bolsa não encontrada')
    }

    return response.ok(scholarship)
  }
}
