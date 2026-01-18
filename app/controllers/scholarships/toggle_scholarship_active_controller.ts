import type { HttpContext } from '@adonisjs/core/http'
import Scholarship from '#models/scholarship'

export default class ToggleScholarshipActiveController {
  async handle({ params, response }: HttpContext) {
    const scholarship = await Scholarship.find(params.id)
    if (!scholarship) {
      return response.notFound({ message: 'Bolsa não encontrada' })
    }

    scholarship.isActive = !scholarship.isActive
    await scholarship.save()

    return response.ok(scholarship)
  }
}
