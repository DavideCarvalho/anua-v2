import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoNotasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/notas', {})
  }
}
