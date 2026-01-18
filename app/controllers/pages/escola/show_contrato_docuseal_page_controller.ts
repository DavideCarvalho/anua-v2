import type { HttpContext } from '@adonisjs/core/http'

export default class ShowContratoDocusealPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/administrativo/contratos/docuseal', {
      contractId: params.id,
    })
  }
}
