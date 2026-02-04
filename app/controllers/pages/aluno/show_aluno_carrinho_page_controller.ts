import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoCarrinhoPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/loja/carrinho')
  }
}
