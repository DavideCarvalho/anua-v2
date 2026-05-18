import { BaseTransformer } from '@adonisjs/core/transformers'
import type AiThread from '#models/ai_thread'
import AiThreadMessageTransformer from '#transformers/ai_thread_message_transformer'

export default class AiThreadTransformer extends BaseTransformer<AiThread> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'title',
        'persona',
        'schoolId',
        'channel',
        'surface',
        'createdAt',
        'updatedAt',
      ]),
      messages: AiThreadMessageTransformer.transform(this.whenLoaded(this.resource.messages)),
    }
  }
}
