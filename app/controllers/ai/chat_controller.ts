import type { HttpContext } from '@adonisjs/core/http'
import type { UIMessage } from 'ai'
import { v7 as uuidv7 } from 'uuid'
import { AiService } from '#ai/ai_service'
import {
  getResumableStreamContext,
  rememberActiveStream,
  clearActiveStream,
} from '#ai/resumable_stream_context'
import { registerStreamController } from '#ai/stream_cancel_broker'
import { personaFromRole, resolvePersonaId } from '#ai/chat_role'
import { computeChatScope } from '#ai/chat_scope'
import type { ChatScope } from '#ai/chat_scope'
import type { ChatRequest } from '#ai/ai_service'
import { checkQuotaOrDeny } from '#ai/usage_quota_service'
import { chatValidator } from '#validators/ai'

export default class ChatController {
  async handle({ request, response, auth, effectiveUser, selectedSchoolIds }: HttpContext) {
    const {
      threadId,
      persona: requestedPersona,
      surface,
      screen,
    } = await request.validateUsing(chatValidator)
    const messages = request.input('messages') as UIMessage[] | undefined

    const user = effectiveUser ?? auth.user!
    const schoolId = selectedSchoolIds?.[0] ?? user.schoolId
    if (!schoolId) {
      return response.badRequest({ message: 'Usuário não vinculado a uma escola' })
    }

    // Persona é derivada do papel do usuário — não do que o front mandou — pra
    // evitar que um professor peça o chat do gestor e vaze dados. Diretor pode
    // alternar entre suas próprias variantes (gestor/comunicador) via override.
    if (!user.$preloaded.role) {
      await user.load('role')
    }
    const defaultPersona = personaFromRole(user.role?.name)
    if (!defaultPersona) {
      return response.forbidden({
        message: 'Seu perfil não tem acesso ao assistente IA ainda',
      })
    }
    const personaId = resolvePersonaId(defaultPersona, requestedPersona)

    const lastUserMessage = [...(messages ?? [])].reverse().find((m) => m.role === 'user')
    if (!lastUserMessage) {
      return response.badRequest({ message: 'Nenhuma mensagem do usuário enviada' })
    }

    // Gate de quota antes de tudo. Default é ilimitado (School.maxMonthlyChatTokens
    // = null), então isso só morde se um admin tiver setado um teto pra escola.
    const quota = await checkQuotaOrDeny(schoolId)
    if (!quota.allowed) {
      return response.tooManyRequests({ message: quota.reason })
    }

    const scope = await computeChatScope({
      role: defaultPersona,
      userId: user.id,
      schoolId,
    })

    // Owned here so req.on('close') and the cancel endpoint can both abort
    // streamText server-side. The client closing its EventSource is not
    // enough — mid-tool-call, the connection-close arrives too late to cut
    // off Bedrock/Mimo, and tokens keep being generated (and billed).
    const abortController = new AbortController()
    const unregisterFromBroker = registerStreamController(threadId, abortController)

    const scopeWithScreen: ChatScope = screen ? { ...scope, screen } : scope
    const resolvedSurface: ChatRequest['surface'] =
      surface === 'sheet' ? 'sheet' : surface === 'page' ? 'page' : undefined

    const aiService = new AiService()
    const { result } = await aiService.chat({
      threadId,
      personaId,
      schoolId,
      userId: user.id,
      userMessage: lastUserMessage,
      scope: scopeWithScreen,
      surface: resolvedSurface,
      abortSignal: abortController.signal,
    })

    const streamId = uuidv7()
    const context = getResumableStreamContext()
    const sourceWebResponse = result.toUIMessageStreamResponse()
    const sseHeaders = new Headers(sourceWebResponse.headers)

    response.response.statusCode = 200
    sseHeaders.forEach((value, key) => {
      response.response.setHeader(key, value)
    })

    // Try to wrap the stream in the resumable buffer. If Redis is down, fall
    // back to streaming the bytes directly without a resume buffer.
    let outputStream: ReadableStream<Uint8Array> | ReadableStream<string> | null = null
    if (context) {
      try {
        await rememberActiveStream(threadId, streamId)
        const resumable = await context.resumableStream(streamId, () =>
          sourceWebResponse.body!.pipeThrough(new TextDecoderStream())
        )
        if (resumable) outputStream = resumable
      } catch {
        outputStream = null
      }
    }
    if (!outputStream) {
      outputStream = sourceWebResponse.body!
    }

    const encoder = new TextEncoder()
    const reader = outputStream.getReader()
    let clientClosed = false
    response.response.on('close', () => {
      clientClosed = true
      abortController.abort()
      reader.cancel().catch(() => {})
    })

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const bytes = typeof value === 'string' ? encoder.encode(value) : value
        response.response.write(bytes)
      }
    } finally {
      unregisterFromBroker()
      response.response.end()
      if (!clientClosed) {
        clearActiveStream(threadId).catch(() => {})
      }
    }
  }
}
