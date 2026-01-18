import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/administrativo/alunos')
  }
}
