import type { HttpContext } from '@adonisjs/core/http'

export default class ShowFaturasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/financeiro/faturas')
  }
}
