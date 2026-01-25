import type { HttpContext } from '@adonisjs/core/http'
import ContractPaymentDay from '#models/contract_payment_day'
import { createContractPaymentDayValidator } from '#validators/contract'
import { ContractPaymentDayDto } from '#models/dto/contract_payment_day.dto'

export default class AddContractPaymentDayController {
  async handle({ params, request }: HttpContext) {
    const { contractId } = params
    const payload = await request.validateUsing(createContractPaymentDayValidator)

    const paymentDay = await ContractPaymentDay.create({
      contractId,
      day: payload.day,
    })

    return new ContractPaymentDayDto(paymentDay)
  }
}
