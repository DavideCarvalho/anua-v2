import type { HttpContext } from '@adonisjs/core/http'
import ContractEarlyDiscount from '#models/contract_early_discount'
import { createContractEarlyDiscountValidator } from '#validators/contract'

export default class AddContractEarlyDiscountController {
  async handle({ params, request, response }: HttpContext) {
    const { contractId } = params
    const payload = await request.validateUsing(createContractEarlyDiscountValidator)

    const earlyDiscount = await ContractEarlyDiscount.create({
      contractId,
      percentage: payload.percentage,
      daysBeforeDeadline: payload.daysBeforeDeadline,
    })

    return response.created(earlyDiscount)
  }
}
