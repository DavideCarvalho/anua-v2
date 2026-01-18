import type { HttpContext } from '@adonisjs/core/http'
import Attendance from '#models/attendance'
import { batchCreateAttendanceValidator } from '#validators/attendance'

export default class BatchCreateAttendanceController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(batchCreateAttendanceValidator)

    const attendanceRecords = data.attendances.map((attendance) => ({
      ...attendance,
      classScheduleId: data.classScheduleId,
    }))

    const attendances = await Attendance.createMany(attendanceRecords)

    return response.created(attendances)
  }
}
