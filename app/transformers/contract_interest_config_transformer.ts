import { BaseTransformer } from '@adonisjs/core/transformers'
import type ContractInterestConfig from '#models/contract_interest_config'

export default class ContractInterestConfigTransformer extends BaseTransformer<ContractInterestConfig> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'contractId',
      'delayInterestPercentage',
      'delayInterestPerDayDelayed',
    ])
  }
}
