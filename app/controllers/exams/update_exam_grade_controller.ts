import type { HttpContext } from '@adonisjs/core/http'
import { saveExamGradeValidator } from '#validators/exam'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'

export default class UpdateExamGradeController {
  async handle({ params, request, response }: HttpContext) {
    const { id, gradeId } = params
    const payload = await request.validateUsing(saveExamGradeValidator)

    const exam = await Exam.find(id)

    if (!exam) {
      return response.notFound({ message: 'Exam not found' })
    }

    const grade = await ExamGrade.query()
      .where('id', gradeId)
      .where('examId', id)
      .first()

    if (!grade) {
      return response.notFound({ message: 'Exam grade not found' })
    }

    grade.merge({
      studentId: payload.studentId,
      score: payload.score,
      feedback: payload.feedback,
      absent: payload.absent || false,
    })

    await grade.save()

    await grade.load('student')
    await grade.load('exam')

    return response.ok(grade)
  }
}
