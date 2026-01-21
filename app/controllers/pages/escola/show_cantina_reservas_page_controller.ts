import type { HttpContext } from '@adonisjs/core/http'

export default class ShowCantinaReservasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('escola/cantina/reservas')
  }
}
