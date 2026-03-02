import { BaseTransformer } from '@adonisjs/core/transformers'
import type ContractEarlyDiscount from '#models/contract_early_discount'

export default class ContractEarlyDiscountTransformer extends BaseTransformer<ContractEarlyDiscount> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'contractId',
      'percentage',
      'daysBeforeDeadline',
      'createdAt',
      'updatedAt',
    ])
  }
}
