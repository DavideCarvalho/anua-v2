import { BaseModelDto } from '@adocasts.com/dto/base'
import type StoreInstallmentRule from '#models/store_installment_rule'

export default class StoreInstallmentRuleDto extends BaseModelDto {
  declare id: string
  declare storeId: string
  declare minAmount: number
  declare maxInstallments: number
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: StoreInstallmentRule) {
    super()

    if (!model) return

    this.id = model.id
    this.storeId = model.storeId
    this.minAmount = model.minAmount
    this.maxInstallments = model.maxInstallments
    this.isActive = model.isActive
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
