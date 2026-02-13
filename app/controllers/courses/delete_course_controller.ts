import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'
import AppException from '#exceptions/app_exception'

export default class DeleteCourseController {
  async handle({ params, response }: HttpContext) {
    const course = await Course.find(params.id)

    if (!course) {
      throw AppException.notFound('Curso não encontrado')
    }

    await course.delete()

    return response.noContent()
  }
}
