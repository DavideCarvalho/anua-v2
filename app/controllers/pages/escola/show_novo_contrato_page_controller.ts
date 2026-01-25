import type { HttpContext } from '@adonisjs/core/http'

export default class ShowNovoContratoPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/administrativo/contratos/novo')
  }
}
