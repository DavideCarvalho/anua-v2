import type { HttpContext } from '@adonisjs/core/http'
import ContractInterestConfig from '#models/contract_interest_config'
import AppException from '#exceptions/app_exception'
import ContractInterestConfigTransformer from '#transformers/contract_interest_config_transformer'

export default class ShowContractInterestConfigController {
  async handle({ params, serialize }: HttpContext) {
    const { contractId } = params

    const interestConfig = await ContractInterestConfig.query()
      .where('contractId', contractId)
      .first()

    if (!interestConfig) {
      throw AppException.notFound('Configuração de juros não encontrada')
    }

    return serialize(ContractInterestConfigTransformer.transform(interestConfig))
  }
}
