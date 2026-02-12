import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Course from '#models/course'
import CourseDto from '#models/dto/course.dto'
import { updateCourseValidator } from '#validators/course'
import AppException from '#exceptions/app_exception'

export default class UpdateCourseController {
  async handle({ params, request, response }: HttpContext) {
    const course = await Course.find(params.id)

    if (!course) {
      throw AppException.notFound('Curso não encontrado')
    }

    const data = await request.validateUsing(updateCourseValidator)

    const updatedCourse = await db.transaction(async (trx) => {
      course.merge({
        name: data.name ?? course.name,
      })
      await course.useTransaction(trx).save()
      return course
    })

    return response.ok(new CourseDto(updatedCourse))
  }
}
