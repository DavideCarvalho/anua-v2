import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'
import AppException from '#exceptions/app_exception'
import CourseTransformer from '#transformers/course_transformer'

export default class ShowCourseController {
  async handle({ params, response, serialize }: HttpContext) {
    const course = await Course.query().where('id', params.id).preload('academicPeriods').first()

    if (!course) {
      throw AppException.notFound('Curso não encontrado')
    }

    return response.ok(await serialize(CourseTransformer.transform(course)))
  }
}
