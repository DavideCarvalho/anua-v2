import { BaseTransformer } from '@adonisjs/core/transformers'
import type ExtraClassSchedule from '#models/extra_class_schedule'

export default class ExtraClassScheduleTransformer extends BaseTransformer<ExtraClassSchedule> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'extraClassId',
      'weekDay',
      'startTime',
      'endTime',
      'createdAt',
      'updatedAt',
    ])
  }
}
