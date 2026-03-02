import { BaseTransformer } from '@adonisjs/core/transformers'
import type GamificationEvent from '#models/gamification_event'
import StudentTransformer from '#transformers/student_transformer'

export default class GamificationEventTransformer extends BaseTransformer<GamificationEvent> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'type',
        'entityType',
        'entityId',
        'studentId',
        'metadata',
        'processed',
        'processedAt',
        'error',
        'createdAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
    }
  }
}
