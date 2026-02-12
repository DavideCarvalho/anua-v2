import type { HttpContext } from '@adonisjs/core/http'
import ContractInterestConfig from '#models/contract_interest_config'
import { ContractInterestConfigDto } from '#models/dto/contract_interest_config.dto'
import AppException from '#exceptions/app_exception'

export default class ShowContractInterestConfigController {
  async handle({ params }: HttpContext) {
    const { contractId } = params

    const interestConfig = await ContractInterestConfig.query()
      .where('contractId', contractId)
      .first()

    if (!interestConfig) {
      throw AppException.notFound('Interest config not found')
    }

    return new ContractInterestConfigDto(interestConfig)
  }
}
