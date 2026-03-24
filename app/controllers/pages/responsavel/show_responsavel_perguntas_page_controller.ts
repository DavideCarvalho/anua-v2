import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelPerguntasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/perguntas', {})
  }
}
