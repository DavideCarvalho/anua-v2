import { BaseTransformer } from '@adonisjs/core/transformers'
import type AiThread from '#models/ai_thread'

export default class AiThreadTransformer extends BaseTransformer<AiThread> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'title',
      'persona',
      'schoolId',
      'channel',
      'surface',
      'createdAt',
      'updatedAt',
    ])
  }
}
