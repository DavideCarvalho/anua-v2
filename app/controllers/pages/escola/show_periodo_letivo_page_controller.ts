import type { HttpContext } from '@adonisjs/core/http'

export default class ShowPeriodoLetivoPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/periodos-letivos/detalhes', {
      academicPeriodSlug: params.slug,
    })
  }
}
