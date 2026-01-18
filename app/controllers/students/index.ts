import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'

export default class IndexStudentsController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const schoolId = request.input('schoolId')
    const classId = request.input('classId')
    const enrollmentStatus = request.input('enrollmentStatus')

    const query = Student.query()
      .preload('user', (userQuery) => {
        userQuery.whereNull('deletedAt')
      })
      .orderBy('createdAt', 'desc')

    if (search) {
      query.whereHas('user', (userQuery) => {
        userQuery
          .whereILike('name', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
          .orWhereILike('documentNumber', `%${search}%`)
      })
    }

    if (schoolId) {
      query.whereHas('user', (userQuery) => {
        userQuery.where('schoolId', schoolId)
      })
    }

    if (classId) {
      query.where('classId', classId)
    }

    if (enrollmentStatus) {
      query.where('enrollmentStatus', enrollmentStatus)
    }

    const students = await query.paginate(page, limit)

    return response.ok(students)
  }
}
