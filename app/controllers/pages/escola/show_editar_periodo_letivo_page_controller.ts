import type { HttpContext } from '@adonisjs/core/http'

export default class ShowEditarPeriodoLetivoPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/administrativo/periodos-letivos/editar', {
      academicPeriodId: params.id,
    })
  }
}
