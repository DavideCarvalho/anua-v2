import type { HttpContext } from '@adonisjs/core/http'

export default class ShowEscolaDashboardPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/index')
  }
}
