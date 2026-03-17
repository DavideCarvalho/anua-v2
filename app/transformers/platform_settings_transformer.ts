import { BaseTransformer } from '@adonisjs/core/transformers'
import type PlatformSettings from '#models/platform_settings'

export default class PlatformSettingsTransformer extends BaseTransformer<PlatformSettings> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'defaultTrialDays',
      'defaultPricePerStudent',
      'defaultStorePlatformFeePercentage',
      'createdAt',
      'updatedAt',
    ])
  }
}
