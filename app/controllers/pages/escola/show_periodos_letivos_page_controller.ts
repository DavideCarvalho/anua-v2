import type { HttpContext } from '@adonisjs/core/http'

export default class ShowPeriodosLetivosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/periodos-letivos')
  }
}
