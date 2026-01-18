import type { HttpContext } from '@adonisjs/core/http'

export default class ShowOcorrenciasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/pedagogico/ocorrencias')
  }
}
