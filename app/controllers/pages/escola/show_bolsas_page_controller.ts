import type { HttpContext } from '@adonisjs/core/http'

export default class ShowBolsasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/administrativo/bolsas')
  }
}
