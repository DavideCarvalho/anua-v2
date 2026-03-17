import type { HttpContext } from '@adonisjs/core/http'
import StudentHasExtraClass from '#models/student_has_extra_class'
import StudentHasExtraClassTransformer from '#transformers/student_has_extra_class_transformer'

export default class ListExtraClassStudentsController {
  async handle({ params, request, serialize }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 50)

    const query = StudentHasExtraClass.query()
      .where('extraClassId', params.id)
      .whereNull('cancelledAt')
      .preload('student', (q) => q.preload('user'))
      .preload('extraClass')
      .orderBy('enrolledAt', 'desc')

    const students = await query.paginate(page, limit)

    const items = students.all()
    const metadata = students.getMeta()
    return await serialize(StudentHasExtraClassTransformer.paginate(items, metadata))
  }
}
