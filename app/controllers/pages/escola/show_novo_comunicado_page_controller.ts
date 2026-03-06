import type { HttpContext } from '@adonisjs/core/http'

export default class ShowNovoComunicadoPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/comunicados/novo', {})
  }
}
