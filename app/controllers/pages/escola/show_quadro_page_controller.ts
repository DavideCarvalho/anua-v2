import type { HttpContext } from '@adonisjs/core/http'

export default class ShowQuadroPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/pedagogico/quadro')
  }
}
