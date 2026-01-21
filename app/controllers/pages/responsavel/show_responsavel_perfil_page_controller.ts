import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelPerfilPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/perfil')
  }
}
