import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'

export default class DeleteTeacherController {
  async handle({ params, response }: HttpContext) {
    const teacher = await Teacher.find(params.id)

    if (!teacher) {
      return response.notFound({ message: 'Professor não encontrado' })
    }

    await teacher.delete()

    return response.noContent()
  }
}
