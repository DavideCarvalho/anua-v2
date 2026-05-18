import { BaseTransformer } from '@adonisjs/core/transformers'
import type AiThread from '#models/ai_thread'
import AiThreadTransformer from '#transformers/ai_thread_transformer'

export type AiThreadDetailResource = {
  thread: AiThread
  hasMore: boolean
  oldestCursor: string | null
}

export default class AiThreadDetailTransformer extends BaseTransformer<AiThreadDetailResource> {
  toObject() {
    return {
      thread: AiThreadTransformer.transform(this.resource.thread),
      hasMore: this.resource.hasMore,
      oldestCursor: this.resource.oldestCursor,
    }
  }
}
