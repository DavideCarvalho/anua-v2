import type { HttpContext } from '@adonisjs/core/http'
import ContractPaymentDay from '#models/contract_payment_day'
import ContractPaymentDayTransformer from '#transformers/contract_payment_day_transformer'

export default class ListContractPaymentDaysController {
  async handle({ params, serialize }: HttpContext) {
    const { contractId } = params

    const paymentDays = await ContractPaymentDay.query()
      .where('contractId', contractId)
      .orderBy('day', 'asc')

    return serialize(ContractPaymentDayTransformer.transform(paymentDays))
  }
}
