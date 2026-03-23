import type { HttpContext } from '@adonisjs/core/http'
import StoreInstallmentRule from '#models/store_installment_rule'
import AppException from '#exceptions/app_exception'

export default class GetInstallmentOptionsController {
  async handle({ request, response }: HttpContext) {
    const storeId = request.input('storeId')
    const amount = request.input('amount')

    if (!storeId || !amount) {
      throw AppException.badRequest('storeId e amount são obrigatórios')
    }

    const rule = await StoreInstallmentRule.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .first()

    if (!rule) {
      return response.ok({
        maxInstallments: 1,
        options: [{ installments: 1, installmentAmount: Number(amount) }],
      })
    }

    const minInstallmentAmount = rule.minInstallmentAmount
    const maxAllowedInstallments = rule.maxInstallments ?? 12

    let maxInstallments: number
    if (minInstallmentAmount > 0) {
      const calculatedMax = Math.floor(Number(amount) / minInstallmentAmount)
      maxInstallments = Math.min(calculatedMax, maxAllowedInstallments)
    } else {
      maxInstallments = maxAllowedInstallments
    }

    const options = Array.from({ length: maxInstallments }, (_, i) => ({
      installments: i + 1,
      installmentAmount: Math.ceil(Number(amount) / (i + 1)),
    }))

    return response.ok({ maxInstallments, options })
  }
}
