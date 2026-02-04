import type { HttpContext } from '@adonisjs/core/http'

export default class ShowLojasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/lojas/index')
  }
}
