import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelPerguntaDetailPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/pergunta-detail', {})
  }
}
