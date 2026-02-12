import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import TeacherHasSubject from '#models/teacher_has_subject'
import AppException from '#exceptions/app_exception'

export default class ListTeacherSubjectsController {
  async handle({ params, response }: HttpContext) {
    const teacher = await Teacher.find(params.id)

    if (!teacher) {
      throw AppException.notFound('Professor não encontrado')
    }

    const teacherSubjects = await TeacherHasSubject.query()
      .where('teacherId', params.id)
      .preload('subject')

    return response.ok(teacherSubjects)
  }
}
