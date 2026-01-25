import type { HttpContext } from '@adonisjs/core/http'
import ContractEarlyDiscount from '#models/contract_early_discount'
import { ContractEarlyDiscountDto } from '#models/dto/contract_early_discount.dto'

export default class ListContractEarlyDiscountsController {
  async handle({ params }: HttpContext) {
    const { contractId } = params

    const earlyDiscounts = await ContractEarlyDiscount.query()
      .where('contractId', contractId)
      .orderBy('daysBeforeDeadline', 'desc')

    return ContractEarlyDiscountDto.fromArray(earlyDiscounts)
  }
}
