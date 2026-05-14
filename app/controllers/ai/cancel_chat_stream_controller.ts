import type { HttpContext } from '@adonisjs/core/http'
import AiThread from '#models/ai_thread'
import { requestStreamCancel } from '#ai/stream_cancel_broker'

export default class CancelChatStreamController {
  async handle({ params, response, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user!
    const threadId = params.threadId as string

    // Verify thread ownership: an authenticated user shouldn't be able to
    // cancel another user's stream just by guessing thread ids. We resolve
    // the thread by id+userId so a wrong owner returns the same shape as a
    // missing thread.
    const thread = await AiThread.query().where('id', threadId).where('userId', user.id).first()
    if (!thread) {
      return response.notFound({ message: 'Thread não encontrada' })
    }

    const aborted = await requestStreamCancel(threadId)
    return response.ok({ aborted })
  }
}
