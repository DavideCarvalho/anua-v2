import type { HttpContext } from '@adonisjs/core/http'
import StoreInstallmentRule from '#models/store_installment_rule'

export default class GetInstallmentOptionsController {
  async handle({ request, response }: HttpContext) {
    const storeId = request.input('storeId')
    const amount = request.input('amount')

    if (!storeId || !amount) {
      return response.badRequest({ message: 'storeId e amount são obrigatórios' })
    }

    const rules = await StoreInstallmentRule.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .where('minAmount', '<=', Number(amount))
      .orderBy('maxInstallments', 'desc')

    const maxInstallments = rules.length > 0 ? rules[0].maxInstallments : 1

    // Build options array: [1, 2, ..., maxInstallments]
    const options = Array.from({ length: maxInstallments }, (_, i) => ({
      installments: i + 1,
      installmentAmount: Math.ceil(Number(amount) / (i + 1)),
    }))

    return response.ok({ maxInstallments, options })
  }
}
