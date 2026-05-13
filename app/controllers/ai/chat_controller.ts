import type { HttpContext } from '@adonisjs/core/http'
import transmit from '@adonisjs/transmit/services/main'
import { AiService } from '../../ai/ai_service.js'
import { chatValidator } from '#validators/ai'

export default class ChatController {
  async handle({ request, response, auth, effectiveUser }: HttpContext) {
    const { message, threadId, persona, clientId } = await request.validateUsing(chatValidator)
    const user = effectiveUser ?? auth.user!
    const schoolId = user.schoolId

    if (!schoolId) {
      return response.badRequest({ message: 'Usuário não vinculado a uma escola' })
    }

    response.ok({ threadId, clientId })

    const aiService = new AiService()
    const streamResult = await aiService.chat(threadId, message, persona ?? 'gestor', {
      schoolId,
      userId: user.id,
      onChunk: clientId
        ? (text) => transmit.broadcast(`ai:${clientId}`, { type: 'chunk', text })
        : undefined,
      onDone: clientId ? () => transmit.broadcast(`ai:${clientId}`, { type: 'done' }) : undefined,
    })

    const webResponse = streamResult.toTextStreamResponse()
    if (!clientId) {
      response.response.writeHead(webResponse.status)
    }
    const reader = webResponse.body!.getReader()
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          if (!clientId) response.response.end()
          break
        }
        if (!clientId) response.response.write(value)
      }
    } catch {
      if (!clientId) response.response.end()
    }
  }
}
