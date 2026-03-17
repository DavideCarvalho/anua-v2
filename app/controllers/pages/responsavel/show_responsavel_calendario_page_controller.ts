import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelCalendarioPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/calendario', {})
  }
}
