import type { HttpContext } from '@adonisjs/core/http'

export default class ShowLojaProdutosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('loja/produtos')
  }
}
