import type { HttpContext } from '@adonisjs/core/http'
import { saveExamGradeValidator } from '#validators/exam'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'

export default class SaveExamGradeController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(saveExamGradeValidator)

    const exam = await Exam.find(id)

    if (!exam) {
      return response.notFound({ message: 'Exam not found' })
    }

    const grade = await ExamGrade.create({
      examId: id,
      studentId: payload.studentId,
      score: payload.score,
      feedback: payload.feedback,
      // Validator provides absent (true = absent), model has attended (true = attended)
      // So if absent is true, attended is false; if absent is undefined/false, attended is true
      attended: payload.absent !== true,
    })

    await grade.load('student')
    await grade.load('exam')

    return response.created(grade)
  }
}
