import type { HttpContext } from '@adonisjs/core/http'
import AssignmentHistory from '#models/assignment_history'
import AssignmentHistoryTransformer from '#transformers/assignment_history_transformer'

export default class ListAssignmentHistoryController {
  async handle({ params, response, serialize }: HttpContext) {
    const histories = await AssignmentHistory.query()
      .where('assignmentId', params.id)
      .preload('actorUser')
      .orderBy('changedAt', 'desc')

    return response.ok({
      data: await serialize(AssignmentHistoryTransformer.transform(histories)),
    })
  }
}
