import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'
import { updateCourseValidator } from '#validators/course'

export default class UpdateCourseController {
  async handle({ params, request, response }: HttpContext) {
    const course = await Course.find(params.id)

    if (!course) {
      return response.notFound({ message: 'Curso não encontrado' })
    }

    const data = await request.validateUsing(updateCourseValidator)

    course.merge(data)
    await course.save()

    return response.ok(course)
  }
}
