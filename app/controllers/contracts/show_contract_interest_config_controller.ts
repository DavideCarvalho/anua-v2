import type { HttpContext } from '@adonisjs/core/http'
import ContractInterestConfig from '#models/contract_interest_config'
import { ContractInterestConfigDto } from '#models/dto/contract_interest_config.dto'

export default class ShowContractInterestConfigController {
  async handle({ params, response }: HttpContext) {
    const { contractId } = params

    const interestConfig = await ContractInterestConfig.query()
      .where('contractId', contractId)
      .first()

    if (!interestConfig) {
      return response.notFound({ message: 'Interest config not found' })
    }

    return new ContractInterestConfigDto(interestConfig)
  }
}
