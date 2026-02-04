import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoPedidosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/loja/pedidos')
  }
}
