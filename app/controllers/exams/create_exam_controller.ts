import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { createExamValidator } from '#validators/exam'
import Exam from '#models/exam'

export default class CreateExamController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createExamValidator)

    const exam = await Exam.create({
      title: payload.title,
      description: payload.description,
      instructions: payload.instructions,
      maxScore: payload.maxScore,
      type: payload.type,
      status: payload.status || 'SCHEDULED',
      scheduledDate: DateTime.fromJSDate(payload.scheduledDate),
      durationMinutes: payload.durationMinutes,
      classId: payload.classId,
      subjectId: payload.subjectId,
      teacherId: payload.teacherId,
    })

    await exam.load('class')
    await exam.load('subject')
    await exam.load('teacher')

    return response.created(exam)
  }
}
