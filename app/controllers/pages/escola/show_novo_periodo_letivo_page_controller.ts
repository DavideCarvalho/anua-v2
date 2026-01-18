import type { HttpContext } from '@adonisjs/core/http'

export default class ShowNovoPeriodoLetivoPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/administrativo/periodos-letivos/novo-periodo-letivo')
  }
}
