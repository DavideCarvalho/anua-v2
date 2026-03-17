import { BaseTransformer } from '@adonisjs/core/transformers'
import type StoreFinancialSettings from '#models/store_financial_settings'

export default class StoreFinancialSettingsTransformer extends BaseTransformer<StoreFinancialSettings> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'storeId',
        'platformFeePercentage',
        'pixKey',
        'pixKeyType',
        'bankName',
        'accountHolder',
        'createdAt',
        'updatedAt',
      ]),
    }
  }
}
