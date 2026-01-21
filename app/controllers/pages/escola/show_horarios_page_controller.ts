import type { HttpContext } from '@adonisjs/core/http'

export default class ShowHorariosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/pedagogico/horarios')
  }
}
