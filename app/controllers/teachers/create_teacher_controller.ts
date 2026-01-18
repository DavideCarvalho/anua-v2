import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import { createTeacherValidator } from '#validators/teacher'

export default class CreateTeacherController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createTeacherValidator)

    const teacher = await Teacher.create({
      id: data.userId,
      hourlyRate: data.hourlyRate ?? 0,
    })

    await teacher.load('user')

    return response.created(teacher)
  }
}
