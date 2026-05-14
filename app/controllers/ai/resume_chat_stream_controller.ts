import type { HttpContext } from '@adonisjs/core/http'
import { getActiveStream, getResumableStreamContext } from '#ai/resumable_stream_context'
import AiThread from '#models/ai_thread'

export default class ResumeChatStreamController {
  async handle({ params, response, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user!
    const threadId = params.threadId as string

    const thread = await AiThread.query()
      .where('id', threadId)
      .where('userId', user.id)
      .first()
    if (!thread) {
      return response.notFound({ message: 'Thread não encontrada' })
    }

    const streamId = await getActiveStream(threadId)
    if (!streamId) {
      return response.noContent()
    }

    const context = getResumableStreamContext()
    if (!context) {
      return response.noContent()
    }
    let resumed: ReadableStream<string> | null | undefined = null
    try {
      resumed = await context.resumeExistingStream(streamId)
    } catch {
      return response.noContent()
    }
    if (!resumed) {
      return response.noContent()
    }

    response.response.statusCode = 200
    response.response.setHeader('Content-Type', 'text/event-stream')
    response.response.setHeader('Cache-Control', 'no-cache')
    response.response.setHeader('Connection', 'keep-alive')
    response.response.setHeader('x-vercel-ai-ui-message-stream', 'v1')

    const encoder = new TextEncoder()
    const reader = resumed.getReader()
    response.response.on('close', () => {
      reader.cancel().catch(() => {})
    })

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        response.response.write(encoder.encode(value))
      }
    } finally {
      response.response.end()
    }
  }
}
