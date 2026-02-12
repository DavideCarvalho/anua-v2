import type { HttpContext } from '@adonisjs/core/http'
import ContractEarlyDiscount from '#models/contract_early_discount'
import { updateContractEarlyDiscountValidator } from '#validators/contract'
import { ContractEarlyDiscountDto } from '#models/dto/contract_early_discount.dto'
import AppException from '#exceptions/app_exception'

export default class UpdateContractEarlyDiscountController {
  async handle({ params, request }: HttpContext) {
    const { contractId, id } = params
    const payload = await request.validateUsing(updateContractEarlyDiscountValidator)

    const earlyDiscount = await ContractEarlyDiscount.query()
      .where('id', id)
      .where('contractId', contractId)
      .first()

    if (!earlyDiscount) {
      throw AppException.notFound('Early discount not found')
    }

    earlyDiscount.merge(payload)
    await earlyDiscount.save()

    return new ContractEarlyDiscountDto(earlyDiscount)
  }
}
