import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelComunicadosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/comunicados')
  }
}
