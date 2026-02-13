import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { updateExamValidator } from '#validators/exam'
import Exam from '#models/exam'
import AppException from '#exceptions/app_exception'

export default class UpdateExamController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(updateExamValidator)

    const exam = await Exam.find(id)

    if (!exam) {
      throw AppException.notFound('Prova não encontrada')
    }

    const updateData: Record<string, unknown> = { ...payload }

    if (payload.scheduledDate) {
      updateData.scheduledDate = DateTime.fromJSDate(payload.scheduledDate)
    }

    exam.merge(updateData)
    await exam.save()

    await exam.load('class')
    await exam.load('subject')
    await exam.load('teacher')

    return response.ok(exam)
  }
}
