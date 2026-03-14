import { BaseTransformer } from '@adonisjs/core/transformers'
import type CanteenFinancialSettings from '#models/canteen_financial_settings'

export default class CanteenFinancialSettingsTransformer extends BaseTransformer<CanteenFinancialSettings> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'canteenId',
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
