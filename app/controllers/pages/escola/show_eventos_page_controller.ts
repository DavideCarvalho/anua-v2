import type { HttpContext } from '@adonisjs/core/http'

export default class ShowEventosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/eventos', {})
  }
}
