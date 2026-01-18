import type { HttpContext } from '@adonisjs/core/http'
import Level from '#models/level'
import { createLevelValidator } from '#validators/level'

export default class CreateLevelController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createLevelValidator)

    const level = await Level.create(data)

    return response.created(level)
  }
}
