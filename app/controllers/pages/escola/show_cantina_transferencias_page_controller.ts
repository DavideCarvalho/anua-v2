import type { HttpContext } from '@adonisjs/core/http'

export default class ShowCantinaTransferenciasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/cantina/transferencias')
  }
}
