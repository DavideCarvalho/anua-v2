import type { HttpContext } from '@adonisjs/core/http'
import StudentHasLevel from '#models/student_has_level'

export default class ListEnrollmentsController {
  async handle({ params, response }: HttpContext) {
    const { id: studentId } = params

    const enrollments = await StudentHasLevel.query()
      .where('studentId', studentId)
      .preload('academicPeriod')
      .preload('contract')
      .preload('scholarship')
      .preload('individualDiscounts', (query) => {
        query.where('isActive', true).whereNull('deletedAt').orderBy('createdAt', 'desc')
      })
      .preload('level')
      .preload('class')
      .orderBy('createdAt', 'desc')

    return response.ok(enrollments)
  }
}
