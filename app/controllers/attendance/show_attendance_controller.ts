import type { HttpContext } from '@adonisjs/core/http'
import Attendance from '#models/attendance'

export default class ShowAttendanceController {
  async handle({ params, response }: HttpContext) {
    const attendance = await Attendance.query()
      .where('id', params.id)
      .preload('calendarSlot')
      .first()

    if (!attendance) {
      return response.notFound({ message: 'Attendance not found' })
    }

    return response.ok(attendance)
  }
}
