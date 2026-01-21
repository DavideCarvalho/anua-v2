import type { HttpContext } from '@adonisjs/core/http'
import StudentHasAttendance from '#models/student_has_attendance'

export default class GetStudentAttendanceController {
  async handle({ params, request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const attendances = await StudentHasAttendance.query()
      .where('studentId', params.studentId)
      .preload('student')
      .preload('attendance', (query) => {
        query.preload('calendarSlot')
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(attendances)
  }
}
