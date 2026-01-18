import type { HttpContext } from '@adonisjs/core/http'

export default class ShowMatriculasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/administrativo/matriculas')
  }
}
