import type { HttpContext } from '@adonisjs/core/http'
import ContractInterestConfig from '#models/contract_interest_config'

export default class ShowContractInterestConfigController {
  async handle({ params, response }: HttpContext) {
    const { contractId } = params

    const interestConfig = await ContractInterestConfig.query()
      .where('contractId', contractId)
      .first()

    if (!interestConfig) {
      return response.notFound({ message: 'Interest config not found' })
    }

    return interestConfig
  }
}
