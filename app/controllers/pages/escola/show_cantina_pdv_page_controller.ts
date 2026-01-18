import type { HttpContext } from '@adonisjs/core/http'

export default class ShowCantinaPdvPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/cantina/pdv')
  }
}
