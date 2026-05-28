import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoHorarioPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/horario', {})
  }
}
