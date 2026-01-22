import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'

export default class ShowClassController {
  async handle({ params, response }: HttpContext) {
    const class_ = await Class_.query()
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

    if (!class_) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    return response.ok(class_)
  }
}
