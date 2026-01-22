import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAtividadePageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/pedagogico/atividades/detalhes', {
      assignmentId: params.id,
    })
  }
}
