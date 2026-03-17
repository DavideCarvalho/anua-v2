import type { HttpContext } from '@adonisjs/core/http'
import Exam from '#models/exam'
import ExamTransformer from '#transformers/exam_transformer'

export default class ListExamsController {
  async handle({ request, serialize }: HttpContext) {
    const { classId, subjectId, teacherId, status, page = 1, limit = 20, courseId } = request.qs()

    const query = Exam.query()
      .preload('class', (classQuery) => {
        classQuery.preload('level')
      })
      .preload('subject')
      .preload('teacher')
      .withCount('grades', (q) => q.as('gradesCount'))
      .orderBy('examDate', 'desc')

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

    const examData = exams.all()

    for (const exam of examData) {
      exam.$extras.courseId = courseId ?? null
    }

    const data = exams.all()
    const metadata = exams.getMeta()

    return serialize(ExamTransformer.paginate(data, metadata))
  }
}
