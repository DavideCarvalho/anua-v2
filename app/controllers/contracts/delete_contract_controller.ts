import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import ContractPaymentDay from '#models/contract_payment_day'
import ContractInterestConfig from '#models/contract_interest_config'
import ContractEarlyDiscount from '#models/contract_early_discount'

export default class DeleteContractController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const contract = await Contract.find(id)

    if (!contract) {
      return response.notFound({ message: 'Contract not found' })
    }

    // Delete related records first
    await ContractPaymentDay.query().where('contractId', id).delete()
    await ContractInterestConfig.query().where('contractId', id).delete()
    await ContractEarlyDiscount.query().where('contractId', id).delete()

    await contract.delete()

    return response.noContent()
  }
}
