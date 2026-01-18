import type { HttpContext } from '@adonisjs/core/http'

export default class ShowMensalidadesPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/financeiro/mensalidades')
  }
}
