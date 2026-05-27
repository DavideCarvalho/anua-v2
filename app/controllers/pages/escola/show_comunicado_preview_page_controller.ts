import type { HttpContext } from '@adonisjs/core/http'

export default class ShowComunicadoPreviewPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/comunicados/preview', {})
  }
}
