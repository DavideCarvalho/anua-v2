import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'
import StudentHasResponsibleTransformer from '#transformers/student_has_responsible_transformer'

export default class ListStudentResponsiblesController {
  async handle({ params, serialize }: HttpContext) {
    const { studentId } = params

    const responsibles = await StudentHasResponsible.query()
      .where('studentId', studentId)
      .preload('responsible', (query) => {
        query.preload('role')
        query.preload('responsibleAddress')
      })
      .orderBy('createdAt', 'desc')

    return serialize(StudentHasResponsibleTransformer.transform(responsibles))
  }
}
