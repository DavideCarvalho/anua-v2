import { createOpenAI } from '@ai-sdk/openai'
import env from '#start/env'

let providerInstance: ReturnType<typeof createOpenAI> | null = null

/**
 * Mimo/DeepSeek-style models on CROF emit a non-standard `reasoning_content` field
 * inside each streaming `delta`. The OpenAI provider in @ai-sdk doesn't expect it
 * and ends up swallowing/breaking the tool_calls parsing. We strip it here so the
 * stream looks like vanilla OpenAI output.
 */
const sanitizingFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init)
  if (!response.ok || !response.body) return response
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('text/event-stream')) return response

  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''

  const transformer = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''
      for (const ev of events) {
        controller.enqueue(encoder.encode(sanitizeEvent(ev) + '\n\n'))
      }
    },
    flush(controller) {
      if (buffer) controller.enqueue(encoder.encode(sanitizeEvent(buffer)))
    },
  })

  return new Response(response.body.pipeThrough(transformer), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}

function sanitizeEvent(event: string): string {
  return event
    .split('\n')
    .map((line) => {
      if (!line.startsWith('data: ')) return line
      const payload = line.slice(6).trim()
      if (payload === '[DONE]' || !payload.startsWith('{')) return line
      try {
        const parsed = JSON.parse(payload) as {
          choices?: Array<{ delta?: Record<string, unknown> }>
        }
        const choices = parsed.choices
        if (choices?.length) {
          for (const choice of choices) {
            if (choice?.delta && 'reasoning_content' in choice.delta) {
              delete choice.delta.reasoning_content
            }
          }
        }
        return 'data: ' + JSON.stringify(parsed)
      } catch {
        return line
      }
    })
    .join('\n')
}

export function getProvider() {
  if (!providerInstance) {
    providerInstance = createOpenAI({
      baseURL: env.get('CROF_API_URL', 'https://crof.ai/v1'),
      apiKey: env.get('CROF_API_KEY'),
      fetch: sanitizingFetch,
    })
  }
  return providerInstance
}

export function getModel(model?: string) {
  const provider = getProvider()
  return provider.chat(model ?? env.get('CROF_MODEL', 'mimo-v2.5-pro'))
}
