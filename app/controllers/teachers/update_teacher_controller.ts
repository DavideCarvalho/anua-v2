import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import { updateTeacherValidator } from '#validators/teacher'
import AppException from '#exceptions/app_exception'
import TeacherTransformer from '#transformers/teacher_transformer'

export default class UpdateTeacherController {
  async handle({ params, request, response, selectedSchoolIds, serialize }: HttpContext) {
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
      throw AppException.notFound('Professor não encontrado')
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

    return response.ok(await serialize(TeacherTransformer.transform(teacher)))
  }
}
