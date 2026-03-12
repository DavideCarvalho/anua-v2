import type { HttpContext } from '@adonisjs/core/http'
import ExamHistory from '#models/exam_history'
import ExamHistoryTransformer from '#transformers/exam_history_transformer'

export default class ListExamHistoryController {
  async handle({ params, response, serialize }: HttpContext) {
    const histories = await ExamHistory.query()
      .where('examId', params.id)
      .preload('actorUser')
      .orderBy('changedAt', 'desc')

    return response.ok({
      data: await serialize(ExamHistoryTransformer.transform(histories)),
    })
  }
}
