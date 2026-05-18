import { BaseTransformer } from '@adonisjs/core/transformers'
import type AiThread from '#models/ai_thread'
import type AiThreadMessage from '#models/ai_thread_message'
import AiThreadTransformer from '#transformers/ai_thread_transformer'
import AiThreadMessageTransformer from '#transformers/ai_thread_message_transformer'

export type AiThreadDetailResource = {
  thread: AiThread
  messages: AiThreadMessage[]
  hasMore: boolean
  oldestCursor: string | null
}

export default class AiThreadDetailTransformer extends BaseTransformer<AiThreadDetailResource> {
  toObject() {
    return {
      thread: AiThreadTransformer.transform(this.resource.thread),
      messages: AiThreadMessageTransformer.transform(this.resource.messages),
      hasMore: this.resource.hasMore,
      oldestCursor: this.resource.oldestCursor,
    }
  }
}
