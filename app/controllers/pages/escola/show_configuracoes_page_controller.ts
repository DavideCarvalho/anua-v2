import type { HttpContext } from '@adonisjs/core/http'

export default class ShowConfiguracoesPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/configuracoes/index')
  }
}
