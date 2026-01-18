import type { HttpContext } from '@adonisjs/core/http'

export default class ShowContratoAssinaturasPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/administrativo/contratos/assinaturas', {
      contractId: params.id,
    })
  }
}
