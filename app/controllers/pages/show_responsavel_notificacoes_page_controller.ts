import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelNotificacoesPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/notificacoes')
  }
}
