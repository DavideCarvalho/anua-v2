import type { HttpContext } from '@adonisjs/core/http'
import Attendance from '#models/attendance'
import { createAttendanceValidator } from '#validators/attendance'

export default class CreateAttendanceController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createAttendanceValidator)

    const attendance = await Attendance.create(data)

    await attendance.load('student')
    await attendance.load('classSchedule')

    return response.created(attendance)
  }
}
