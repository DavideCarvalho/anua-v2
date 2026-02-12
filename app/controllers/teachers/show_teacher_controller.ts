import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import AppException from '#exceptions/app_exception'

export default class ShowTeacherController {
  async handle({ params, response }: HttpContext) {
    const teacher = await Teacher.query().where('id', params.id).preload('user').first()

    if (!teacher) {
      throw AppException.notFound('Professor não encontrado')
    }

    return response.ok(teacher)
  }
}
