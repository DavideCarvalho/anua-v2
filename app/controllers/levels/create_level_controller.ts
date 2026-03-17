import type { HttpContext } from '@adonisjs/core/http'
import Level from '#models/level'
import { createLevelValidator } from '#validators/level'
import LevelTransformer from '#transformers/level_transformer'

export default class CreateLevelController {
  async handle({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createLevelValidator)

    const level = await Level.create({
      ...data,
      isActive: data.isActive ?? true,
    })

    return response.created(await serialize(LevelTransformer.transform(level)))
  }
}
