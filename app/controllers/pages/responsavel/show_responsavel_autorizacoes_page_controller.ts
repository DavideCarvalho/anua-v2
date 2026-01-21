import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelAutorizacoesPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/autorizacoes')
  }
}
