import { BaseTransformer } from '@adonisjs/core/transformers'
import type Attendance from '#models/attendance'
import CalendarSlotTransformer from '#transformers/calendar_slot_transformer'

export default class AttendanceTransformer extends BaseTransformer<Attendance> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'note',
        'date',
        'calendarSlotId',
        'createdAt',
        'updatedAt',
      ]),
      calendarSlot: CalendarSlotTransformer.transform(this.whenLoaded(this.resource.calendarSlot)),
    }
  }
}
