import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import { ContractDto } from '#models/dto/contract.dto'

export default class ShowContractController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const contract = await Contract.find(id)

    if (!contract) {
      return response.notFound({ message: 'Contract not found' })
    }

    await contract.load('school')
    await contract.load('paymentDays')
    await contract.load('interestConfig')
    await contract.load('earlyDiscounts')
    await contract.load('contractDocuments')

    return new ContractDto(contract)
  }
}
