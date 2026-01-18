import { BaseModelDto } from '@adocasts.com/dto/base'
import type ContractPaymentDay from '#models/contract_payment_day'

export class ContractPaymentDayDto extends BaseModelDto {
  declare id: string
  declare contractId: string
  declare day: number
  declare createdAt: string
  declare updatedAt: string

  constructor(instance?: ContractPaymentDay) {
    super()

    if (!instance) return

    this.id = instance.id
    this.contractId = instance.contractId
    this.day = instance.day
    this.createdAt = instance.createdAt.toISO()!
    this.updatedAt = instance.updatedAt.toISO()!
  }
}

export class CreateContractPaymentDayDto extends BaseModelDto {
  declare contractId: string
  declare day: number

  constructor(data: { contractId: string; day: number }) {
    super()
    this.contractId = data.contractId
    this.day = data.day
  }
}
