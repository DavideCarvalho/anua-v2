import type { HttpContext } from '@adonisjs/core/http'
import ContractPaymentDay from '#models/contract_payment_day'
import { ContractPaymentDayDto } from '#models/dto/contract_payment_day.dto'

export default class ListContractPaymentDaysController {
  async handle({ params }: HttpContext) {
    const { contractId } = params

    const paymentDays = await ContractPaymentDay.query()
      .where('contractId', contractId)
      .orderBy('day', 'asc')

    return ContractPaymentDayDto.fromArray(paymentDays)
  }
}
