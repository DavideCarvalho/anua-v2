import type { HttpContext } from '@adonisjs/core/http'
import { resolveEscolaCanteenContext } from './cantina_context.js'

export default class ShowCantinaPedidosPageController {
  async handle({ inertia, selectedSchoolIds, request }: HttpContext) {
    const context = await resolveEscolaCanteenContext({
      selectedSchoolIds,
      preferredCanteenId: request.input('canteenId'),
    })

    return inertia.render('escola/cantina/pedidos', context)
  }
}
