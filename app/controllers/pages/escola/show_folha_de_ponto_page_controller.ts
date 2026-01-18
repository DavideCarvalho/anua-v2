import type { HttpContext } from '@adonisjs/core/http'

export default class ShowFolhaDePontoPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/administrativo/folha-de-ponto')
  }
}
