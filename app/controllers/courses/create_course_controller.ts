import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'
import { createCourseValidator } from '#validators/course'
import CourseTransformer from '#transformers/course_transformer'

export default class CreateCourseController {
  async handle({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createCourseValidator)

    const course = await Course.create({
      ...data,
      version: 1,
    })

    return response.created(await serialize(CourseTransformer.transform(course)))
  }
}
