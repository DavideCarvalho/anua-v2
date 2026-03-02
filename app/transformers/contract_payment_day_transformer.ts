import { BaseTransformer } from '@adonisjs/core/transformers'
import type ContractPaymentDay from '#models/contract_payment_day'

export default class ContractPaymentDayTransformer extends BaseTransformer<ContractPaymentDay> {
  toObject() {
    return this.pick(this.resource, ['id', 'contractId', 'day'])
  }
}
