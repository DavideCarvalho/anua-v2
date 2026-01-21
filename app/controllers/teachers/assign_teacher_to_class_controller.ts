import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import TeacherHasClass from '#models/teacher_has_class'
import { assignTeacherToClassValidator } from '#validators/teacher'

export default class AssignTeacherToClassController {
  async handle({ params, request, response }: HttpContext) {
    const teacher = await Teacher.find(params.id)

    if (!teacher) {
      return response.notFound({ message: 'Professor não encontrado' })
    }

    const data = await request.validateUsing(assignTeacherToClassValidator)

    const teacherHasClass = await TeacherHasClass.create({
      teacherId: params.id,
      classId: data.classId,
      subjectId: data.subjectId,
      subjectQuantity: data.subjectQuantity ?? 1,
      isActive: true,
    })

    await teacherHasClass.load('class')

    return response.created(teacherHasClass)
  }
}
