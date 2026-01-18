import type { HttpContext } from '@adonisjs/core/http'

export default class ShowCantinaPedidosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/cantina/pedidos')
  }
}
