import type { HttpContext } from '@adonisjs/core/http'
import ContractEarlyDiscount from '#models/contract_early_discount'
import { createContractEarlyDiscountValidator } from '#validators/contract'
import ContractEarlyDiscountTransformer from '#transformers/contract_early_discount_transformer'

export default class AddContractEarlyDiscountController {
  async handle({ params, request, serialize }: HttpContext) {
    const { contractId } = params
    const payload = await request.validateUsing(createContractEarlyDiscountValidator)

    const earlyDiscount = await ContractEarlyDiscount.create({
      contractId,
      percentage: payload.percentage,
      daysBeforeDeadline: payload.daysBeforeDeadline,
    })

    return serialize(ContractEarlyDiscountTransformer.transform(earlyDiscount))
  }
}
