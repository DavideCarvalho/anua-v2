import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'

export default class RemoveResponsibleController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const assignment = await StudentHasResponsible.findOrFail(id)
    await assignment.delete()

    return response.noContent()
  }
}
