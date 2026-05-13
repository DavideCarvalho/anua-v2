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

    const channel = clientId ? `ai:${clientId}` : undefined

    const aiService = new AiService()
    const streamResult = await aiService.chat(threadId, message, persona ?? 'gestor', {
      schoolId,
      userId: user.id,
      onChunk: channel ? (text) => transmit.broadcast(channel, { type: 'chunk', text }) : undefined,
      onDone: channel ? () => transmit.broadcast(channel, { type: 'done' }) : undefined,
    })

    if (!channel && streamResult) {
      const webResponse = streamResult.toTextStreamResponse()
      response.response.writeHead(webResponse.status)
      const reader = webResponse.body!.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            response.response.end()
            break
          }
          response.response.write(value)
        }
      } catch {
        response.response.end()
      }
    }
  }
}
