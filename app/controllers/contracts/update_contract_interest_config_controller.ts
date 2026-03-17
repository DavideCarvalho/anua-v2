import type { HttpContext } from '@adonisjs/core/http'
import ContractInterestConfig from '#models/contract_interest_config'
import { updateContractInterestConfigValidator } from '#validators/contract'
import ContractInterestConfigTransformer from '#transformers/contract_interest_config_transformer'

export default class UpdateContractInterestConfigController {
  async handle({ params, request, serialize }: HttpContext) {
    const { contractId } = params
    const payload = await request.validateUsing(updateContractInterestConfigValidator)

    const existingConfig = await ContractInterestConfig.query()
      .where('contractId', contractId)
      .first()

    if (existingConfig) {
      existingConfig.merge(payload)
      await existingConfig.save()
      return serialize(ContractInterestConfigTransformer.transform(existingConfig))
    }

    const interestConfig = await ContractInterestConfig.create({
      contractId,
      ...payload,
    })

    return serialize(ContractInterestConfigTransformer.transform(interestConfig))
  }
}
