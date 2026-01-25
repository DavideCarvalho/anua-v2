import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'

export default class ShowCourseController {
  async handle({ params, response }: HttpContext) {
    const course = await Course.query().where('id', params.id).preload('academicPeriods').first()

    if (!course) {
      return response.notFound({ message: 'Curso não encontrado' })
    }

    return response.ok(course)
  }
}
