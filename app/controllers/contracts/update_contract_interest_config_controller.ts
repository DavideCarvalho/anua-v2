import type { HttpContext } from '@adonisjs/core/http'
import ContractInterestConfig from '#models/contract_interest_config'
import { updateContractInterestConfigValidator } from '#validators/contract'
import { ContractInterestConfigDto } from '#models/dto/contract_interest_config.dto'

export default class UpdateContractInterestConfigController {
  async handle({ params, request }: HttpContext) {
    const { contractId } = params
    const payload = await request.validateUsing(updateContractInterestConfigValidator)

    const existingConfig = await ContractInterestConfig.query()
      .where('contractId', contractId)
      .first()

    if (existingConfig) {
      existingConfig.merge(payload)
      await existingConfig.save()
      return new ContractInterestConfigDto(existingConfig)
    }

    const interestConfig = await ContractInterestConfig.create({
      contractId,
      ...payload,
    })

    return new ContractInterestConfigDto(interestConfig)
  }
}
