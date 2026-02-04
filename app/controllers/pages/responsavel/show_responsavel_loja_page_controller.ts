import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelLojaPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/loja')
  }
}
