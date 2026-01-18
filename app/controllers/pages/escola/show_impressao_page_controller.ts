import type { HttpContext } from '@adonisjs/core/http'

export default class ShowImpressaoPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/administrativo/impressao')
  }
}
