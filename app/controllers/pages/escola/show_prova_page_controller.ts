import type { HttpContext } from '@adonisjs/core/http'

export default class ShowProvaPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/pedagogico/provas/detalhes', {
      examId: params.id,
    })
  }
}
