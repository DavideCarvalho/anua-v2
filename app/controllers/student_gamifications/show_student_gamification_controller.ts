import type { HttpContext } from '@adonisjs/core/http'
import StudentGamification from '#models/student_gamification'

export default class ShowStudentGamificationController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const gamification = await StudentGamification.query()
      .where('id', id)
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .first()

    if (!gamification) {
      return response.notFound({ message: 'Student gamification not found' })
    }

    return response.ok(gamification)
  }
}
