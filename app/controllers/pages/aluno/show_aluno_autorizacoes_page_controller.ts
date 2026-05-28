import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoAutorizacoesPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/autorizacoes', {})
  }
}
