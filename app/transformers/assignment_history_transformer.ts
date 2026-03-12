import { BaseTransformer } from '@adonisjs/core/transformers'
import type AssignmentHistory from '#models/assignment_history'
import UserTransformer from '#transformers/user_transformer'

export default class AssignmentHistoryTransformer extends BaseTransformer<AssignmentHistory> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'assignmentId', 'actorUserId', 'changedAt', 'changes']),
      actorUser: UserTransformer.transform(this.whenLoaded(this.resource.actorUser)),
    }
  }
}
