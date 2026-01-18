import type { HttpContext } from '@adonisjs/core/http'
import { updateResponsibleAssignmentValidator } from '#validators/responsible'
import StudentHasResponsible from '#models/student_has_responsible'
import { StudentHasResponsibleDto } from '#models/dto/student_has_responsible.dto'

export default class UpdateResponsibleAssignmentController {
  async handle({ params, request }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(updateResponsibleAssignmentValidator)

    const assignment = await StudentHasResponsible.findOrFail(id)

    assignment.merge(payload)
    await assignment.save()

    await assignment.load('responsible', (query) => {
      query.preload('role')
    })
    await assignment.load('student', (query) => {
      query.preload('user')
    })

    return new StudentHasResponsibleDto(assignment)
  }
}
