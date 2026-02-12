import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import { ContractDto } from '#models/dto/contract.dto'
import AppException from '#exceptions/app_exception'

export default class ShowContractController {
  async handle({ params }: HttpContext) {
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

    return new ContractDto(contract)
  }
}
