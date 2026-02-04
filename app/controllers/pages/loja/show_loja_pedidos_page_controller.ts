import type { HttpContext } from '@adonisjs/core/http'

export default class ShowLojaPedidosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('loja/pedidos')
  }
}
