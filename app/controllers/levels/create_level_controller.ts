import type { HttpContext } from '@adonisjs/core/http'
import Level from '#models/level'
import { createLevelValidator } from '#validators/level'

export default class CreateLevelController {
  async handle({ request, response }: HttpContext) {
    let data
    try {
      data = await request.validateUsing(createLevelValidator)
    } catch (error) {
      return response.badRequest({ message: 'Erro de validação', errors: error.messages })
    }

    const level = await Level.create({
      ...data,
      isActive: data.isActive ?? true,
    })

    return response.created(level)
  }
}
