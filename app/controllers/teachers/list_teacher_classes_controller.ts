import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'
import TeacherHasClass from '#models/teacher_has_class'
import AppException from '#exceptions/app_exception'
import TeacherHasClassDto from '#models/dto/teacher_has_class.dto'

export default class ListTeacherClassesController {
  async handle({ params, response }: HttpContext) {
    const teacher = await Teacher.find(params.id)

    if (!teacher) {
      throw AppException.notFound('Professor não encontrado')
    }

    const teacherClasses = await TeacherHasClass.query()
      .where('teacherId', params.id)
      .preload('class')
      .orderBy('createdAt', 'desc')

    return response.ok(TeacherHasClassDto.fromArray(teacherClasses))
  }
}
