import type { HttpContext } from '@adonisjs/core/http'
import StudentHasExtraClass from '#models/student_has_extra_class'
import StudentHasExtraClassDto from '#models/dto/student_has_extra_class.dto'

export default class ListExtraClassStudentsController {
  async handle({ params, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 50)

    const query = StudentHasExtraClass.query()
      .where('extraClassId', params.id)
      .whereNull('cancelledAt')
      .preload('student', (q) => q.preload('user'))
      .preload('extraClass')
      .orderBy('enrolledAt', 'desc')

    const students = await query.paginate(page, limit)

    return StudentHasExtraClassDto.fromPaginator(students)
  }
}
