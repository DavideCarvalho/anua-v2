import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import { createClassValidator } from '#validators/class'

export default class CreateClassController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createClassValidator)

    const classEntity = await Class_.create(data)

    return response.created(classEntity)
  }
}
