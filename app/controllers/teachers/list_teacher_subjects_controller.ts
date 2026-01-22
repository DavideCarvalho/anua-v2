import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import TeacherHasSubject from '#models/teacher_has_subject'

export default class ListTeacherSubjectsController {
  async handle({ params, response }: HttpContext) {
    const teacher = await Teacher.find(params.id)

    if (!teacher) {
      return response.notFound({ message: 'Professor não encontrado' })
    }

    const teacherSubjects = await TeacherHasSubject.query()
      .where('teacherId', params.id)
      .preload('subject')

    return response.ok(teacherSubjects)
  }
}
