import type { HttpContext } from '@adonisjs/core/http'

export default class ShowGamificacaoDesafiosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/gamificacao/desafios', {})
  }
}
