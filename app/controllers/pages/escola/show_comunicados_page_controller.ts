import type { HttpContext } from '@adonisjs/core/http'

export default class ShowComunicadosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/comunicados', {})
  }
}
