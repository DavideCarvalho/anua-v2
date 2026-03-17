import type { HttpContext } from '@adonisjs/core/http'
import ExtraClassAttendance from '#models/extra_class_attendance'
import ExtraClassAttendanceTransformer from '#transformers/extra_class_attendance_transformer'

export default class ListExtraClassAttendancesController {
  async handle({ params, request, serialize }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const query = ExtraClassAttendance.query()
      .where('extraClassId', params.id)
      .preload('studentAttendances', (q) => {
        q.preload('student', (sq) => sq.preload('user'))
      })
      .orderBy('date', 'desc')

    const attendances = await query.paginate(page, limit)

    const items = attendances.all()
    const metadata = attendances.getMeta()
    return await serialize(ExtraClassAttendanceTransformer.paginate(items, metadata))
  }
}
