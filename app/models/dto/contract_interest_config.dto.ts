import { BaseModelDto } from '@adocasts.com/dto/base'
import type ContractInterestConfig from '#models/contract_interest_config'

export class ContractInterestConfigDto extends BaseModelDto {
  declare id: string
  declare contractId: string
  declare delayInterestPercentage: number
  declare delayInterestPerDayDelayed: number
  declare createdAt: string
  declare updatedAt: string

  constructor(instance?: ContractInterestConfig) {
    super()

    if (!instance) return

    this.id = instance.id
    this.contractId = instance.contractId
    this.delayInterestPercentage = instance.delayInterestPercentage
    this.delayInterestPerDayDelayed = instance.delayInterestPerDayDelayed
    this.createdAt = instance.createdAt.toISO()!
    this.updatedAt = instance.updatedAt.toISO()!
  }
}

export class CreateContractInterestConfigDto extends BaseModelDto {
  declare contractId: string
  declare delayInterestPercentage?: number
  declare delayInterestPerDayDelayed?: number

  constructor(data: {
    contractId: string
    delayInterestPercentage?: number
    delayInterestPerDayDelayed?: number
  }) {
    super()
    this.contractId = data.contractId
    this.delayInterestPercentage = data.delayInterestPercentage
    this.delayInterestPerDayDelayed = data.delayInterestPerDayDelayed
  }
}

export class UpdateContractInterestConfigDto extends BaseModelDto {
  declare delayInterestPercentage?: number
  declare delayInterestPerDayDelayed?: number

  constructor(data: { delayInterestPercentage?: number; delayInterestPerDayDelayed?: number }) {
    super()
    this.delayInterestPercentage = data.delayInterestPercentage
    this.delayInterestPerDayDelayed = data.delayInterestPerDayDelayed
  }
}
