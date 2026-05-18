import type { HttpContext } from '@adonisjs/core/http'
import AiThread from '#models/ai_thread'

export default class ListThreadsController {
  async handle({ response, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user!

    const threads = await AiThread.query()
      .where('userId', user.id)
      .where('surface', 'page')
      // Exclui threads de WhatsApp — surface default é 'page' mas channel
      // segrega o canal de origem. Sem isso, conversas do bot do WhatsApp
      // vazam pro chat fullscreen do /escola/ia.
      .where('channel', 'web')
      .preload('messages', (query) => {
        query.orderBy('createdAt', 'desc').limit(1)
      })
      .orderBy('updatedAt', 'desc')

    const data = threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      persona: thread.persona,
      lastMessage: thread.messages[0]?.content ?? null,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }))

    return response.ok(data)
  }
}
