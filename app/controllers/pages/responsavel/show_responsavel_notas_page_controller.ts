import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelNotasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/notas')
  }
}
