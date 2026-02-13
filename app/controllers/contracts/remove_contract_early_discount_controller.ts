import type { HttpContext } from '@adonisjs/core/http'
import ContractEarlyDiscount from '#models/contract_early_discount'
import AppException from '#exceptions/app_exception'

export default class RemoveContractEarlyDiscountController {
  async handle({ params }: HttpContext) {
    const { contractId, id } = params

    const earlyDiscount = await ContractEarlyDiscount.query()
      .where('id', id)
      .where('contractId', contractId)
      .first()

    if (!earlyDiscount) {
      throw AppException.notFound('Desconto por antecipação não encontrado')
    }

    await earlyDiscount.delete()
  }
}
