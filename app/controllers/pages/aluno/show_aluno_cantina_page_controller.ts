import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoCantinaPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('aluno/cantina', {})
  }
}
