import type { HttpContext } from '@adonisjs/core/http'
import Attendance from '#models/attendance'
import AppException from '#exceptions/app_exception'
import AttendanceTransformer from '#transformers/attendance_transformer'

export default class ShowAttendanceController {
  async handle({ params, response, serialize }: HttpContext) {
    const attendance = await Attendance.query()
      .where('id', params.id)
      .preload('calendarSlot')
      .first()

    if (!attendance) {
      throw AppException.notFound('Chamada não encontrada')
    }

    return response.ok(await serialize(AttendanceTransformer.transform(attendance)))
  }
}
