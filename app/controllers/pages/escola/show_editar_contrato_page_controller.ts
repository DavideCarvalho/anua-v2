import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'

export default class ShowEditarContratoPageController {
  async handle({ inertia, params, response }: HttpContext) {
    const contract = await Contract.query()
      .where('id', params.id)
      .preload('paymentDays')
      .preload('interestConfig')
      .preload('earlyDiscounts')
      .first()

    if (!contract) {
      return response.notFound({ message: 'Contrato não encontrado' })
    }

    return inertia.render('escola/administrativo/contratos/editar', {
      contract,
    })
  }
}
