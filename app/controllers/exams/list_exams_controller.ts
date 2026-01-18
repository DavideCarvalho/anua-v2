import type { HttpContext } from '@adonisjs/core/http'
import Exam from '#models/exam'

export default class ListExamsController {
  async handle({ request, response }: HttpContext) {
    const { classId, subjectId, teacherId, status, page = 1, limit = 20 } = request.qs()

    const query = Exam.query()
      .preload('class')
      .preload('subject')
      .preload('teacher')
      .orderBy('scheduledDate', 'desc')

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

    const exams = await query.paginate(page, limit)

    return response.ok(exams)
  }
}
