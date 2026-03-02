import type { HttpContext } from '@adonisjs/core/http'
import StudentHasAttendance from '#models/student_has_attendance'
import StudentHasAttendanceTransformer from '#transformers/student_has_attendance_transformer'
import { listAttendanceValidator } from '#validators/attendance'

export default class ListAttendanceController {
  async handle({ request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listAttendanceValidator)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 10
    const calendarSlotId = filters.calendarSlotId
    const studentId = filters.studentId
    const date = filters.date
    const status = filters.status

    const query = StudentHasAttendance.query()
      .preload('student')
      .preload('attendance', (q) => {
        q.preload('calendarSlot')
      })

    if (calendarSlotId) {
      query.whereHas('attendance', (q) => q.where('calendarSlotId', calendarSlotId))
    }

    if (studentId) {
      query.where('studentId', studentId)
    }

    if (date) {
      query.whereHas('attendance', (q) => q.whereRaw('DATE(date) = ?', [date]))
    }

    if (status) {
      query.where('status', status)
    }

    const attendances = await query.paginate(page, limit)
    const data = attendances.all()
    const metadata = attendances.getMeta()

    return serialize(StudentHasAttendanceTransformer.paginate(data, metadata))
  }
}
