import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelCantinaPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/cantina')
  }
}
