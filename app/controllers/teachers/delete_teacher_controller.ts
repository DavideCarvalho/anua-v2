import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import AppException from '#exceptions/app_exception'

export default class DeleteTeacherController {
  async handle({ params, response }: HttpContext) {
    const teacher = await Teacher.find(params.id)

    if (!teacher) {
      throw AppException.notFound('Professor não encontrado')
    }

    await teacher.delete()

    return response.noContent()
  }
}
