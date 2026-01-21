import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'
import { createCourseValidator } from '#validators/course'

export default class CreateCourseController {
  async handle({ request, response }: HttpContext) {
    let data
    try {
      data = await request.validateUsing(createCourseValidator)
    } catch (error) {
      return response.badRequest({ message: 'Erro de validação', errors: error.messages })
    }

    const course = await Course.create({
      ...data,
      version: 1,
    })

    return response.created(course)
  }
}
