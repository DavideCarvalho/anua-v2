import type { HttpContext } from '@adonisjs/core/http'

export default class ShowCantinaItensPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/cantina/itens')
  }
}
