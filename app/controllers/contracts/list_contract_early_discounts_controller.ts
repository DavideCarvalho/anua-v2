import type { HttpContext } from '@adonisjs/core/http'
import ContractEarlyDiscount from '#models/contract_early_discount'
import ContractEarlyDiscountTransformer from '#transformers/contract_early_discount_transformer'

export default class ListContractEarlyDiscountsController {
  async handle({ params, serialize }: HttpContext) {
    const { contractId } = params

    const earlyDiscounts = await ContractEarlyDiscount.query()
      .where('contractId', contractId)
      .orderBy('daysBeforeDeadline', 'desc')

    return serialize(ContractEarlyDiscountTransformer.transform(earlyDiscounts))
  }
}
