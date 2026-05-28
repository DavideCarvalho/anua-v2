import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoCalendarioPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/calendario', {})
  }
}
