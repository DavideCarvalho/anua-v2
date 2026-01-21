import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelFrequenciaPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/frequencia')
  }
}
