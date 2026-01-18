import type { HttpContext } from '@adonisjs/core/http'
import Attendance from '#models/attendance'
import { updateAttendanceValidator } from '#validators/attendance'

export default class UpdateAttendanceController {
  async handle({ params, request, response }: HttpContext) {
    const attendance = await Attendance.find(params.id)

    if (!attendance) {
      return response.notFound({ message: 'Attendance not found' })
    }

    const data = await request.validateUsing(updateAttendanceValidator)

    attendance.merge(data)
    await attendance.save()

    await attendance.load('student')
    await attendance.load('classSchedule')

    return response.ok(attendance)
  }
}
