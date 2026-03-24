import type { HttpContext } from '@adonisjs/core/http'

export default class ShowPerguntaDetailPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/pergunta-detail', {})
  }
}
