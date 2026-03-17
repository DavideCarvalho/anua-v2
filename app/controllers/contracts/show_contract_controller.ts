import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import AppException from '#exceptions/app_exception'
import ContractTransformer from '#transformers/contract_transformer'

export default class ShowContractController {
  async handle({ params, serialize }: HttpContext) {
    const { id } = params

    const contract = await Contract.find(id)

    if (!contract) {
      throw AppException.contractNotFound()
    }

    await contract.load('school')
    await contract.load('paymentDays')
    await contract.load('interestConfig')
    await contract.load('earlyDiscounts')
    await contract.load('contractDocuments')

    return serialize(ContractTransformer.transform(contract))
  }
}
