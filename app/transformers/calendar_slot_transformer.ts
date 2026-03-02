import { BaseTransformer } from '@adonisjs/core/transformers'
import type CalendarSlot from '#models/calendar_slot'

export default class CalendarSlotTransformer extends BaseTransformer<CalendarSlot> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'teacherHasClassId',
      'classWeekDay',
      'startTime',
      'endTime',
      'minutes',
      'calendarId',
      'isBreak',
      'createdAt',
      'updatedAt',
    ])
  }
}
