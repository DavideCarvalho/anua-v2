import type { HttpContext } from '@adonisjs/core/http'
import { AiService } from '../../ai/ai_service.js'
import { chatValidator } from '#validators/ai'

export default class ChatController {
  async handle({ request, response, auth, effectiveUser }: HttpContext) {
    const { message, threadId, persona } = await request.validateUsing(chatValidator)
    const user = effectiveUser ?? auth.user!
    const schoolId = user.schoolId

    if (!schoolId) {
      return response.badRequest({ message: 'Usuário não vinculado a uma escola' })
    }

    const aiService = new AiService()
    const streamResult = await aiService.chat(threadId, message, persona ?? 'gestor', {
      schoolId,
      userId: user.id,
    })

    const webResponse = streamResult.toTextStreamResponse()
    const headers = [...webResponse.headers.entries()]
    for (const [key, value] of headers) {
      response.response.setHeader(key, value)
    }

    response.response.writeHead(webResponse.status)
    const reader = webResponse.body!.getReader()

    const pump = async () => {
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

    await pump()
  }
}
