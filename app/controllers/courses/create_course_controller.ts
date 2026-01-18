import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'
import { createCourseValidator } from '#validators/course'

export default class CreateCourseController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createCourseValidator)

    const course = await Course.create(data)

    return response.created(course)
  }
}
