import type { HttpContext } from '@adonisjs/core/http'

export default class ShowFuncionariosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/administrativo/funcionarios')
  }
}
