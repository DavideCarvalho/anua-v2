import type { HttpContext } from '@adonisjs/core/http'

export default class ShowSolicitacoesDeCompraPageController {
  async handle({ inertia, params }: HttpContext) {
    const { schoolSlug } = params

    // TODO: Get schoolId from slug if needed
    // For now, we pass the slug and let the frontend handle it
    return inertia.render('escola/administrativo/solicitacoes-de-compra', {
      schoolId: schoolSlug,
    })
  }
}
