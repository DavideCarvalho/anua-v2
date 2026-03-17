import type { HttpContext } from '@adonisjs/core/http'
import ContractEarlyDiscount from '#models/contract_early_discount'
import { updateContractEarlyDiscountValidator } from '#validators/contract'
import AppException from '#exceptions/app_exception'
import ContractEarlyDiscountTransformer from '#transformers/contract_early_discount_transformer'

export default class UpdateContractEarlyDiscountController {
  async handle({ params, request, serialize }: HttpContext) {
    const { contractId, id } = params
    const payload = await request.validateUsing(updateContractEarlyDiscountValidator)

    const earlyDiscount = await ContractEarlyDiscount.query()
      .where('id', id)
      .where('contractId', contractId)
      .first()

    if (!earlyDiscount) {
      throw AppException.notFound('Desconto por antecipação não encontrado')
    }

    earlyDiscount.merge(payload)
    await earlyDiscount.save()

    return serialize(ContractEarlyDiscountTransformer.transform(earlyDiscount))
  }
}
