import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelCreditoPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/credito')
  }
}
