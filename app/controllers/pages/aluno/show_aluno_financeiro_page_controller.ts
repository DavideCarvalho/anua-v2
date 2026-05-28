import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoFinanceiroPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/financeiro', {})
  }
}
