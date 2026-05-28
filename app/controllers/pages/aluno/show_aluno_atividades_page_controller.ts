import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoAtividadesPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/atividades', {})
  }
}
