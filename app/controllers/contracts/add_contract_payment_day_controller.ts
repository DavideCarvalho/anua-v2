import type { HttpContext } from '@adonisjs/core/http'
import ContractPaymentDay from '#models/contract_payment_day'
import { createContractPaymentDayValidator } from '#validators/contract'
import ContractPaymentDayTransformer from '#transformers/contract_payment_day_transformer'

export default class AddContractPaymentDayController {
  async handle({ params, request, serialize }: HttpContext) {
    const { contractId } = params
    const payload = await request.validateUsing(createContractPaymentDayValidator)

    const paymentDay = await ContractPaymentDay.create({
      contractId,
      day: payload.day,
    })

    return serialize(ContractPaymentDayTransformer.transform(paymentDay))
  }
}
