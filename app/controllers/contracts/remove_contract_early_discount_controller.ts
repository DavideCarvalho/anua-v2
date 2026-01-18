import type { HttpContext } from '@adonisjs/core/http'
import ContractEarlyDiscount from '#models/contract_early_discount'

export default class RemoveContractEarlyDiscountController {
  async handle({ params, response }: HttpContext) {
    const { contractId, id } = params

    const earlyDiscount = await ContractEarlyDiscount.query()
      .where('id', id)
      .where('contractId', contractId)
      .first()

    if (!earlyDiscount) {
      return response.notFound({ message: 'Early discount not found' })
    }

    await earlyDiscount.delete()

    return response.noContent()
  }
}
