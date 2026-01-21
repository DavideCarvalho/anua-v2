import type { HttpContext } from '@adonisjs/core/http'

export default class ShowCursosNiveisPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/pedagogico/cursos-niveis')
  }
}
