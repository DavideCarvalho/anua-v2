import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import { updateTeacherValidator } from '#validators/teacher'

export default class UpdateTeacherController {
  async handle({ params, request, response }: HttpContext) {
    const teacher = await Teacher.find(params.id)

    if (!teacher) {
      return response.notFound({ message: 'Professor não encontrado' })
    }

    const data = await request.validateUsing(updateTeacherValidator)

    teacher.merge(data)
    await teacher.save()

    await teacher.load('user')

    return response.ok(teacher)
  }
}
