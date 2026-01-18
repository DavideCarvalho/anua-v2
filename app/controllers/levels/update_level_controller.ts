import type { HttpContext } from '@adonisjs/core/http'
import Level from '#models/level'
import { updateLevelValidator } from '#validators/level'

export default class UpdateLevelController {
  async handle({ params, request, response }: HttpContext) {
    const level = await Level.find(params.id)

    if (!level) {
      return response.notFound({ message: 'Nível não encontrado' })
    }

    const data = await request.validateUsing(updateLevelValidator)

    level.merge(data)
    await level.save()

    return response.ok(level)
  }
}
