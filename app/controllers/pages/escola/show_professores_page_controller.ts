import type { HttpContext } from '@adonisjs/core/http'

export default class ShowProfessoresPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/administrativo/professores')
  }
}
