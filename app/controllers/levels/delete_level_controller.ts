import type { HttpContext } from '@adonisjs/core/http'
import Level from '#models/level'
import AppException from '#exceptions/app_exception'

export default class DeleteLevelController {
  async handle({ params, response }: HttpContext) {
    const level = await Level.find(params.id)

    if (!level) {
      throw AppException.notFound('Nível não encontrado')
    }

    await level.delete()

    return response.noContent()
  }
}
