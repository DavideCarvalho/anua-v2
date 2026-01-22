import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'

export default class ListAssignmentsController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const classId = request.input('classId')
    const subjectId = request.input('subjectId')
    const teacherId = request.input('teacherId')
    const academicPeriodId = request.input('academicPeriodId')

    const query = Assignment.query()
      .preload('teacherHasClass', (query) => {
        query.preload('class')
        query.preload('subject')
        query.preload('teacher', (tq) => tq.preload('user'))
      })
      .withCount('submissions', (q) => q.as('submissionsCount'))
      .orderBy('dueDate', 'desc')

    if (classId) {
      query.whereHas('teacherHasClass', (q) => q.where('classId', classId))
    }

    if (subjectId) {
      query.whereHas('teacherHasClass', (q) => q.where('subjectId', subjectId))
    }

    if (teacherId) {
      query.whereHas('teacherHasClass', (q) => q.where('teacherId', teacherId))
    }

    if (academicPeriodId) {
      query.where('academicPeriodId', academicPeriodId)
    }

    const assignments = await query.paginate(page, limit)

    return response.ok(assignments)
  }
}
