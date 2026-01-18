import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'
import { StudentHasResponsibleDto } from '#models/dto/student_has_responsible.dto'

export default class ListStudentResponsiblesController {
  async handle({ params }: HttpContext) {
    const { studentId } = params

    const responsibles = await StudentHasResponsible.query()
      .where('studentId', studentId)
      .preload('responsible', (query) => {
        query.preload('role')
        query.preload('responsibleAddress')
      })
      .orderBy('createdAt', 'desc')

    return StudentHasResponsibleDto.fromArray(responsibles)
  }
}
