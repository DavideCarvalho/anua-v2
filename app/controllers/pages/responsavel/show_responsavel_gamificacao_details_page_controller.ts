import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'

export default class ShowResponsavelGamificacaoDetailsPageController {
  async handle({ params, response, inertia, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      return response.redirect('/login')
    }

    const { studentId } = params

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.redirect('/responsavel/gamificacao')
    }

    return inertia.render('responsavel/gamificacao-details', {
      studentId,
    })
  }
}
