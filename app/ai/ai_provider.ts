import { createOpenAI } from '@ai-sdk/openai'
import env from '#start/env'

let _provider: ReturnType<typeof createOpenAI> | null = null

export function getProvider() {
  if (!_provider) {
    _provider = createOpenAI({
      baseURL: env.get('CROF_API_URL', 'https://crof.ai/v1'),
      apiKey: env.get('CROF_API_KEY'),
    })
  }
  return _provider
}

export function getModel(model?: string) {
  const provider = getProvider()
  return provider(model ?? env.get('CROF_MODEL', 'gpt-4o'))
}
