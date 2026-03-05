import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import ClassDetailDto from '#models/dto/class_detail.dto'
import AppException from '#exceptions/app_exception'

export default class ShowClassController {
  async handle({ params }: HttpContext) {
    const classEntity = await Class_.query()
      .where('id', params.id)
      .preload('level')
      .preload('students')
      .preload('teachers')
      .preload('teacherClasses', (query) => {
        query.where('isActive', true)
        query.preload('teacher', (teacherQuery) => {
          teacherQuery.preload('user')
        })
        query.preload('subject')
      })
      .first()

    if (!classEntity) {
      throw AppException.notFound('Turma não encontrada')
    }

    return new ClassDetailDto(classEntity)
  }
}
