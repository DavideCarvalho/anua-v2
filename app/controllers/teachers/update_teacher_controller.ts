import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import { updateTeacherValidator } from '#validators/teacher'

export default class UpdateTeacherController {
  async handle({ params, request, response, selectedSchoolIds }: HttpContext) {
    const teacher = await Teacher.query()
      .where('id', params.id)
      .whereHas('teacherClasses', (teacherClassQuery) => {
        teacherClassQuery.whereHas('class', (classQuery) => {
          classQuery.whereIn('schoolId', selectedSchoolIds ?? [])
        })
      })
      .preload('user')
      .first()

    if (!teacher) {
      return response.notFound({ message: 'Professor não encontrado' })
    }

    const data = await request.validateUsing(updateTeacherValidator)

    // Update User fields (name, email, active)
    if (data.name || data.email || data.active !== undefined) {
      teacher.user.merge({
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.active !== undefined && { active: data.active }),
      })
      await teacher.user.save()
    }

    // Update Teacher fields (hourlyRate)
    if (data.hourlyRate !== undefined) {
      teacher.merge({ hourlyRate: data.hourlyRate })
      await teacher.save()
    }

    await teacher.load('user')

    return response.ok(teacher)
  }
}
