import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'
import CourseDto from '#models/dto/course.dto'
import { createCourseValidator } from '#validators/course'

export default class CreateCourseController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createCourseValidator)

    const course = await Course.create({
      ...data,
      version: 1,
    })

    return response.created(new CourseDto(course))
  }
}
