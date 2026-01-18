import type { HttpContext } from '@adonisjs/core/http'
import StudentGamification from '#models/student_gamification'
import { listStudentGamificationsValidator } from '#validators/gamification'

export default class ListStudentGamificationsController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(listStudentGamificationsValidator)

    const page = payload.page || 1
    const limit = payload.limit || 10

    const query = StudentGamification.query()
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
      .orderBy('createdAt', 'desc')

    if (payload.schoolId) {
      query.whereHas('student', (studentQuery) => {
        studentQuery.whereHas('user', (userQuery) => {
          userQuery.where('schoolId', payload.schoolId!)
        })
      })
    }

    if (payload.studentId) {
      query.where('studentId', payload.studentId)
    }

    const gamifications = await query.paginate(page, limit)

    return response.ok(gamifications)
  }
}
