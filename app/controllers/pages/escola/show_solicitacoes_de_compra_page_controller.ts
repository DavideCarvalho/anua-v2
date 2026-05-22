import type { HttpContext } from '@adonisjs/core/http'

export default class ShowSolicitacoesDeCompraPageController {
  async handle({ inertia, selectedSchoolIds }: HttpContext) {
    return inertia.render('escola/administrativo/solicitacoes-de-compra', {
      schoolId: selectedSchoolIds?.[0] ?? '',
    })
  }
}
