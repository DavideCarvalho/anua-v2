import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoOcorrenciasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/ocorrencias', {})
  }
}
