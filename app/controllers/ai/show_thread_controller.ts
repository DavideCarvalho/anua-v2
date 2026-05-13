import type { HttpContext } from '@adonisjs/core/http'
import AiThread from '#models/ai_thread'

export default class ShowThreadController {
  async handle({ params, response, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user!

    const thread = await AiThread.query()
      .where('id', params.id)
      .where('userId', user.id)
      .preload('messages', (query) => {
        query.orderBy('createdAt', 'asc')
      })
      .first()

    if (!thread) {
      return response.notFound({ message: 'Thread não encontrada' })
    }

    return response.ok(thread.serialize())
  }
}
