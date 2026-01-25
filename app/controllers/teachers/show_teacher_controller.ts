import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'

export default class ShowTeacherController {
  async handle({ params, response }: HttpContext) {
    const teacher = await Teacher.query().where('id', params.id).preload('user').first()

    if (!teacher) {
      return response.notFound({ message: 'Professor não encontrado' })
    }

    return response.ok(teacher)
  }
}
