import type { HttpContext } from '@adonisjs/core/http'

export default class ShowLojaFinanceiroPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('loja/financeiro')
  }
}
