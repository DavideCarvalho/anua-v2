import type { HttpContext } from '@adonisjs/core/http'
import Level from '#models/level'

export default class DeleteLevelController {
  async handle({ params, response }: HttpContext) {
    const level = await Level.find(params.id)

    if (!level) {
      return response.notFound({ message: 'Nível não encontrado' })
    }

    await level.delete()

    return response.noContent()
  }
}
