import type { HttpContext } from '@adonisjs/core/http'
import AiThread from '#models/ai_thread'
import AiThreadMessage from '#models/ai_thread_message'
import AiThreadDetailTransformer from '#transformers/ai_thread_detail_transformer'
import { showThreadQueryValidator } from '#validators/ai'

const DEFAULT_LIMIT = 20

export default class ShowThreadController {
  async handle({ params, request, response, auth, effectiveUser, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user!

    const thread = await AiThread.query().where('id', params.id).where('userId', user.id).first()

    if (!thread) {
      return response.notFound({ message: 'Thread não encontrada' })
    }

    const { limit: limitInput, before: beforeId } =
      await request.validateUsing(showThreadQueryValidator)
    const limit = limitInput ?? DEFAULT_LIMIT

    const messagesQuery = AiThreadMessage.query()
      .where('threadId', thread.id)
      .orderBy('createdAt', 'desc')
      .orderBy('id', 'desc')
      .limit(limit + 1)

    if (beforeId) {
      const cursor = await AiThreadMessage.query()
        .where('id', beforeId)
        .where('threadId', thread.id)
        .first()
      if (cursor) {
        // Cursor pelo createdAt desc com id como tiebreaker — em streamings
        // rápidos várias mensagens podem cair no mesmo millisecond.
        const cursorTime = cursor.createdAt.toSQL() ?? ''
        messagesQuery.where((q) => {
          q.where('createdAt', '<', cursorTime).orWhere((q2) => {
            q2.where('createdAt', cursorTime).andWhere('id', '<', cursor.id)
          })
        })
      }
    }

    const fetched = await messagesQuery
    const hasMore = fetched.length > limit
    const sliced = hasMore ? fetched.slice(0, limit) : fetched
    const oldestCursor = sliced.length > 0 ? sliced[sliced.length - 1]!.id : null

    // UI espera ordem ascendente (mais antigas primeiro). Buscamos desc pra
    // pegar as últimas N de forma eficiente; revertemos antes de devolver.
    const messages = sliced.slice().reverse()

    return serialize(
      AiThreadDetailTransformer.transform({ thread, messages, hasMore, oldestCursor })
    )
  }
}
