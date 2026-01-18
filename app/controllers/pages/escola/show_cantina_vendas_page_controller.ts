import type { HttpContext } from '@adonisjs/core/http'

export default class ShowCantinaVendasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/cantina/vendas')
  }
}
