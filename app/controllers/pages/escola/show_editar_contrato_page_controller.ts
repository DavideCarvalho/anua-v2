import type { HttpContext } from '@adonisjs/core/http'

export default class ShowEditarContratoPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/administrativo/contratos/editar', {
      id: params.id,
    })
  }
}
