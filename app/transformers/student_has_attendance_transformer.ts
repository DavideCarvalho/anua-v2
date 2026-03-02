import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentHasAttendance from '#models/student_has_attendance'
import StudentTransformer from '#transformers/student_transformer'
import AttendanceTransformer from '#transformers/attendance_transformer'

export default class StudentHasAttendanceTransformer extends BaseTransformer<StudentHasAttendance> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'attendanceId',
        'status',
        'justification',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
      attendance: AttendanceTransformer.transform(this.whenLoaded(this.resource.attendance)),
    }
  }
}
