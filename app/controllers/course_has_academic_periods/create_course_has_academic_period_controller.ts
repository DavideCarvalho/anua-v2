import type { HttpContext } from '@adonisjs/core/http'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import { createCourseHasAcademicPeriodValidator } from '#validators/course_has_academic_period'

export default class CreateCourseHasAcademicPeriodController {
  async handle({ request, response }: HttpContext) {
    let data
    try {
      data = await request.validateUsing(createCourseHasAcademicPeriodValidator)
    } catch (error) {
      return response.badRequest({ message: 'Erro de validação', errors: error.messages })
    }

    const courseHasAcademicPeriod = await CourseHasAcademicPeriod.create(data)

    return response.created(courseHasAcademicPeriod)
  }
}
