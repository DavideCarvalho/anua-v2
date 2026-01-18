import type { HttpContext } from '@adonisjs/core/http'

export default class ShowGamificacaoPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/gamificacao/index')
  }
}
