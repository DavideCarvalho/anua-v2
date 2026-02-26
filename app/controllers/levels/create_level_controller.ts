import type { HttpContext } from '@adonisjs/core/http'
import Level from '#models/level'
import LevelDto from '#models/dto/level.dto'
import { createLevelValidator } from '#validators/level'

export default class CreateLevelController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createLevelValidator)

    const level = await Level.create({
      ...data,
      isActive: data.isActive ?? true,
    })

    return response.created(new LevelDto(level))
  }
}
