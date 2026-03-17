import type { HttpContext } from '@adonisjs/core/http'
import StudentGamification from '#models/student_gamification'
import AppException from '#exceptions/app_exception'
import StudentGamificationTransformer from '#transformers/student_gamification_transformer'

export default class ShowStudentGamificationController {
  async handle({ params, response, serialize }: HttpContext) {
    const { id } = params

    const gamification = await StudentGamification.query()
      .where('id', id)
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .first()

    if (!gamification) {
      throw AppException.notFound('Gamificação do aluno não encontrada')
    }

    return response.ok(await serialize(StudentGamificationTransformer.transform(gamification)))
  }
}
