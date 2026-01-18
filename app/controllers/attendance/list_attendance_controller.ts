import type { HttpContext } from '@adonisjs/core/http'
import Attendance from '#models/attendance'

export default class ListAttendanceController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const classId = request.input('classId')
    const studentId = request.input('studentId')
    const date = request.input('date')
    const status = request.input('status')

    const query = Attendance.query()

    if (classId) {
      query.where('classScheduleId', classId)
    }

    if (studentId) {
      query.where('studentId', studentId)
    }

    if (date) {
      query.whereRaw('DATE(created_at) = ?', [date])
    }

    if (status) {
      query.where('status', status)
    }

    const attendances = await query
      .preload('student')
      .preload('classSchedule')
      .paginate(page, limit)

    return response.ok(attendances)
  }
}
