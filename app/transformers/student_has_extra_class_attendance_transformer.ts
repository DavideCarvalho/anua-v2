import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentHasExtraClassAttendance from '#models/student_has_extra_class_attendance'
import StudentTransformer from '#transformers/student_transformer'

export default class StudentHasExtraClassAttendanceTransformer extends BaseTransformer<StudentHasExtraClassAttendance> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'extraClassAttendanceId',
        'status',
        'justification',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student))?.depth(6),
    }
  }
}
