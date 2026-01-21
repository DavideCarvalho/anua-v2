import type { HttpContext } from '@adonisjs/core/http'

export default class ShowContratoFinanceiroPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/administrativo/contratos/financeiro', {
      contractId: params.contractId,
    })
  }
}
