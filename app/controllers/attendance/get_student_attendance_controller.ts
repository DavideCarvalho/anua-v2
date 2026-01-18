import type { HttpContext } from '@adonisjs/core/http'
import Attendance from '#models/attendance'

export default class GetStudentAttendanceController {
  async handle({ params, request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const attendances = await Attendance.query()
      .where('studentId', params.studentId)
      .preload('student')
      .preload('classSchedule')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(attendances)
  }
}
