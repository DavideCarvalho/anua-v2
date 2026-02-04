import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoLojaPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/loja/index')
  }
}
