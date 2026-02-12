import type { HttpContext } from '@adonisjs/core/http'

export default class ShowEditarEventoPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/eventos/editar', {
      eventId: params.eventId,
    })
  }
}
