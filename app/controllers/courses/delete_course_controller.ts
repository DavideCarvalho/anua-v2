import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'

export default class DeleteCourseController {
  async handle({ params, response }: HttpContext) {
    const course = await Course.find(params.id)

    if (!course) {
      return response.notFound({ message: 'Curso não encontrado' })
    }

    await course.delete()

    return response.noContent()
  }
}
