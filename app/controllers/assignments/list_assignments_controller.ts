import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'

export default class ListAssignmentsController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const classId = request.input('classId')
    const subjectId = request.input('subjectId')
    const teacherId = request.input('teacherId')
    const status = request.input('status')

    const query = Assignment.query()
      .preload('class')
      .preload('subject')
      .preload('teacher')
      .orderBy('dueDate', 'desc')

    if (classId) {
      query.where('classId', classId)
    }

    if (subjectId) {
      query.where('subjectId', subjectId)
    }

    if (teacherId) {
      query.where('teacherId', teacherId)
    }

    if (status) {
      query.where('status', status)
    }

    const assignments = await query.paginate(page, limit)

    return response.ok(assignments)
  }
}
