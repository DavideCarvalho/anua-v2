import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelOcorrenciasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/ocorrencias')
  }
}
