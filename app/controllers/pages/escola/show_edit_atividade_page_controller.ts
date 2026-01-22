import type { HttpContext } from '@adonisjs/core/http'

export default class ShowEditAtividadePageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/pedagogico/atividades/editar', {
      assignmentId: params.id,
    })
  }
}
