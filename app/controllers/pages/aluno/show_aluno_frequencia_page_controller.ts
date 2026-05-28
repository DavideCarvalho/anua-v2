import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoFrequenciaPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/frequencia', {})
  }
}
