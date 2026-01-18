import type { HttpContext } from '@adonisjs/core/http'

export default class ShowInadimplenciaPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/financeiro/inadimplencia')
  }
}
