import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import TeacherHasClass from '#models/teacher_has_class'

export default class RemoveTeacherFromClassController {
  async handle({ params, response }: HttpContext) {
    const teacher = await Teacher.find(params.id)

    if (!teacher) {
      return response.notFound({ message: 'Professor não encontrado' })
    }

    const teacherHasClass = await TeacherHasClass.query()
      .where('teacherId', params.id)
      .where('classId', params.classId)
      .first()

    if (!teacherHasClass) {
      return response.notFound({ message: 'Associação professor-turma não encontrada' })
    }

    await teacherHasClass.delete()

    return response.noContent()
  }
}
