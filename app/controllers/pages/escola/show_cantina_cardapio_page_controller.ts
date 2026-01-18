import type { HttpContext } from '@adonisjs/core/http'

export default class ShowCantinaCardapioPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/cantina/cardapio')
  }
}
