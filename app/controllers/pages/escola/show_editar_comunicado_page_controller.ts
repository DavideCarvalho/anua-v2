import type { HttpContext } from '@adonisjs/core/http'

export default class ShowEditarComunicadoPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/comunicados/editar', {
      comunicadoId: params.id,
    })
  }
}
