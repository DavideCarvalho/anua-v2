import { BaseModelDto } from '@adocasts.com/dto/base'
import type ContractEarlyDiscount from '#models/contract_early_discount'

export class ContractEarlyDiscountDto extends BaseModelDto {
  declare id: string
  declare contractId: string
  declare percentage: number
  declare daysBeforeDeadline: number
  declare createdAt: string
  declare updatedAt: string

  constructor(instance?: ContractEarlyDiscount) {
    super()

    if (!instance) return

    this.id = instance.id
    this.contractId = instance.contractId
    this.percentage = instance.percentage
    this.daysBeforeDeadline = instance.daysBeforeDeadline
    this.createdAt = instance.createdAt.toISO()!
    this.updatedAt = instance.updatedAt.toISO()!
  }
}

export class CreateContractEarlyDiscountDto extends BaseModelDto {
  declare contractId: string
  declare percentage: number
  declare daysBeforeDeadline: number

  constructor(data: { contractId: string; percentage: number; daysBeforeDeadline: number }) {
    super()
    this.contractId = data.contractId
    this.percentage = data.percentage
    this.daysBeforeDeadline = data.daysBeforeDeadline
  }
}

export class UpdateContractEarlyDiscountDto extends BaseModelDto {
  declare percentage?: number
  declare daysBeforeDeadline?: number

  constructor(data: { percentage?: number; daysBeforeDeadline?: number }) {
    super()
    this.percentage = data.percentage
    this.daysBeforeDeadline = data.daysBeforeDeadline
  }
}
