import type { HttpContext } from '@adonisjs/core/http'

export default class ShowGamificacaoRecompensasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/gamificacao/recompensas')
  }
}
