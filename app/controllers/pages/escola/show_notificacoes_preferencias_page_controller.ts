import type { HttpContext } from '@adonisjs/core/http'

export default class ShowNotificacoesPreferenciasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/notificacoes/preferencias')
  }
}
