import type { HttpContext } from '@adonisjs/core/http'
import Scholarship from '#models/scholarship'

export default class ShowScholarshipController {
  async handle({ params, response }: HttpContext) {
    const scholarship = await Scholarship.query().where('id', params.id).first()

    if (!scholarship) {
      return response.notFound({ message: 'Bolsa não encontrada' })
    }

    return response.ok(scholarship)
  }
}
