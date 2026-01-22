import type { HttpContext } from '@adonisjs/core/http'

export default class ShowEditProvaPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/pedagogico/provas/editar', {
      examId: params.id,
    })
  }
}
