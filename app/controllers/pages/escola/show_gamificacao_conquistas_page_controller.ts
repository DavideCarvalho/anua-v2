import type { HttpContext } from '@adonisjs/core/http'

export default class ShowGamificacaoConquistasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/gamificacao/conquistas')
  }
}
