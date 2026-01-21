import type { HttpContext } from '@adonisjs/core/http'
import StudentHasAttendance from '#models/student_has_attendance'

export default class ListAttendanceController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const calendarSlotId = request.input('calendarSlotId')
    const studentId = request.input('studentId')
    const date = request.input('date')
    const status = request.input('status')

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

    return response.ok(attendances)
  }
}
