import { BaseTransformer } from '@adonisjs/core/transformers'
import type StoreInstallmentRule from '#models/store_installment_rule'

export default class StoreInstallmentRuleTransformer extends BaseTransformer<StoreInstallmentRule> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'storeId',
      'minAmount',
      'maxInstallments',
      'isActive',
      'createdAt',
      'updatedAt',
    ])
  }
}
