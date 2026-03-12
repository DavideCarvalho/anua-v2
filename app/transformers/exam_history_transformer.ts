import { BaseTransformer } from '@adonisjs/core/transformers'
import type ExamHistory from '#models/exam_history'
import UserTransformer from '#transformers/user_transformer'

export default class ExamHistoryTransformer extends BaseTransformer<ExamHistory> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'examId', 'actorUserId', 'changedAt', 'changes']),
      actorUser: UserTransformer.transform(this.whenLoaded(this.resource.actorUser)),
    }
  }
}
