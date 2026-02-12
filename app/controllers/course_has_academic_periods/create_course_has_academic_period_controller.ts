import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import { createCourseHasAcademicPeriodValidator } from '#validators/course_has_academic_period'

export default class CreateCourseHasAcademicPeriodController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createCourseHasAcademicPeriodValidator)

    // Usa transaction para garantir atomicidade
    const courseHasAcademicPeriod = await db.transaction(async (trx) => {
      // Cria explicitando campos permitidos (evita mass assignment)
      const newCourseHasAcademicPeriod = await CourseHasAcademicPeriod.create(
        {
          courseId: data.courseId,
          academicPeriodId: data.academicPeriodId,
        },
        { client: trx }
      )

      return newCourseHasAcademicPeriod
    })

    return response.created(courseHasAcademicPeriod)
  }
}
