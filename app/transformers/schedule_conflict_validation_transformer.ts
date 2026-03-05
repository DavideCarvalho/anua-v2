import { BaseTransformer } from '@adonisjs/core/transformers'

export interface ScheduleConflictValidation {
  hasConflict: boolean
  reason?: string
  teacherName?: string
}

export default class ScheduleConflictValidationTransformer extends BaseTransformer<ScheduleConflictValidation> {
  toObject() {
    return this.pick(this.resource, ['hasConflict', 'reason', 'teacherName'])
  }
}
