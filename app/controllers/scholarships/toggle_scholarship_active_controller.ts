import type { HttpContext } from '@adonisjs/core/http'
import Scholarship from '#models/scholarship'
import AppException from '#exceptions/app_exception'

export default class ToggleScholarshipActiveController {
  async handle({ params, response }: HttpContext) {
    const scholarship = await Scholarship.find(params.id)
    if (!scholarship) {
      throw AppException.notFound('Bolsa não encontrada')
    }

    scholarship.isActive = !scholarship.isActive
    await scholarship.save()

    return response.ok(scholarship)
  }
}
