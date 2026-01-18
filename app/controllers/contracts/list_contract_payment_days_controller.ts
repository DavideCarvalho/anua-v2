import type { HttpContext } from '@adonisjs/core/http'
import ContractPaymentDay from '#models/contract_payment_day'

export default class ListContractPaymentDaysController {
  async handle({ params }: HttpContext) {
    const { contractId } = params

    const paymentDays = await ContractPaymentDay.query()
      .where('contractId', contractId)
      .orderBy('day', 'asc')

    return paymentDays
  }
}
