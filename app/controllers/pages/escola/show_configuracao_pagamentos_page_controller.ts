import type { HttpContext } from '@adonisjs/core/http'

export default class ShowConfiguracaoPagamentosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/financeiro/configuracao-pagamentos')
  }
}
