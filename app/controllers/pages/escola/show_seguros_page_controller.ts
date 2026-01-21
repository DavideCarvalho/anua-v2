import type { HttpContext } from '@adonisjs/core/http'

export default class ShowSegurosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/seguros')
  }
}
