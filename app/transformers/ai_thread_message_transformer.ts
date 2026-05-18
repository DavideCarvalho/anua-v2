import { BaseTransformer } from '@adonisjs/core/transformers'
import type AiThreadMessage from '#models/ai_thread_message'

export default class AiThreadMessageTransformer extends BaseTransformer<AiThreadMessage> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'threadId', 'role', 'content', 'createdAt']),
      toolCalls: this.resource.toolCalls,
      toolResults: this.resource.toolResults,
    }
  }
}
