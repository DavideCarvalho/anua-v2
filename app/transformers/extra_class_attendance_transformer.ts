import { BaseTransformer } from '@adonisjs/core/transformers'
import type ExtraClassAttendance from '#models/extra_class_attendance'
import StudentHasExtraClassAttendanceTransformer from '#transformers/student_has_extra_class_attendance_transformer'

export default class ExtraClassAttendanceTransformer extends BaseTransformer<ExtraClassAttendance> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'extraClassId',
        'extraClassScheduleId',
        'date',
        'note',
        'createdAt',
        'updatedAt',
      ]),
      studentAttendances: StudentHasExtraClassAttendanceTransformer.transform(
        this.whenLoaded(this.resource.studentAttendances)
      ),
    }
  }
}
