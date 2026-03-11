import type { HttpContext } from '@adonisjs/core/http'

export default class ShowPedagogicoCalendarioPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/pedagogico/calendario', {})
  }
}
