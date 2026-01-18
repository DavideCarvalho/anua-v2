import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'

export default class ShowStudentController {
  async handle({ params, response }: HttpContext) {
    const student = await Student.query()
      .where('id', params.id)
      .preload('user', (userQuery) => {
        userQuery
          .whereNull('deletedAt')
          .preload('role')
          .preload('school')
      })
      .preload('documents', (docsQuery) => {
        docsQuery.preload('contractDocument')
      })
      .first()

    if (!student) {
      return response.notFound({ message: 'Aluno não encontrado' })
    }

    return response.ok(student)
  }
}
