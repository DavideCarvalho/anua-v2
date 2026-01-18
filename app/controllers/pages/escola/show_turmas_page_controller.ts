import type { HttpContext } from '@adonisjs/core/http'

export default class ShowTurmasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/pedagogico/turmas')
  }
}
