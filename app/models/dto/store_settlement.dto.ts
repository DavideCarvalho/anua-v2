import { BaseModelDto } from '@adocasts.com/dto/base'
import type StoreSettlement from '#models/store_settlement'
import type { StoreSettlementStatus } from '#models/store_settlement'
import type { DateTime } from 'luxon'

export default class StoreSettlementDto extends BaseModelDto {
  declare id: string
  declare storeId: string
  declare month: number
  declare year: number
  declare totalSalesAmount: number
  declare commissionAmount: number
  declare platformFeeAmount: number
  declare transferAmount: number
  declare status: StoreSettlementStatus
  declare approvedBy: string | null
  declare approvedAt: DateTime | null
  declare processedAt: DateTime | null
  declare pixTransactionId: string | null
  declare failureReason: string | null
  declare notes: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(settlement?: StoreSettlement) {
    super()

    if (!settlement) return

    this.id = settlement.id
    this.storeId = settlement.storeId
    this.month = settlement.month
    this.year = settlement.year
    this.totalSalesAmount = settlement.totalSalesAmount
    this.commissionAmount = settlement.commissionAmount
    this.platformFeeAmount = settlement.platformFeeAmount
    this.transferAmount = settlement.transferAmount
    this.status = settlement.status
    this.approvedBy = settlement.approvedBy
    this.approvedAt = settlement.approvedAt
    this.processedAt = settlement.processedAt
    this.pixTransactionId = settlement.pixTransactionId
    this.failureReason = settlement.failureReason
    this.notes = settlement.notes
    this.createdAt = settlement.createdAt
    this.updatedAt = settlement.updatedAt
  }
}
