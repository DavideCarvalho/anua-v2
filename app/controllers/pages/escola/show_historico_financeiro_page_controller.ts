import type { HttpContext } from '@adonisjs/core/http'

export default class ShowHistoricoFinanceiroPageController {
  async handle({ inertia, request }: HttpContext) {
    const studentId = request.qs().studentId

    return inertia.render('escola/administrativo/alunos/historico-financeiro', {
      studentId,
    })
  }
}
