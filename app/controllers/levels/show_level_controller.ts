import type { HttpContext } from '@adonisjs/core/http'
import Level from '#models/level'
import AppException from '#exceptions/app_exception'

export default class ShowLevelController {
  async handle({ params, response }: HttpContext) {
    const level = await Level.query()
      .where('id', params.id)
      .preload('school')
      .preload('classes')
      .first()

    if (!level) {
      throw AppException.notFound('Nível não encontrado')
    }

    return response.ok(level)
  }
}
