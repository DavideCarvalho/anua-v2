import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelGamificacaoPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/gamificacao')
  }
}
