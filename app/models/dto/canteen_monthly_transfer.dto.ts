import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenMonthlyTransfer from '#models/canteen_monthly_transfer'
import type { CanteenMonthlyTransferStatus } from '#models/canteen_monthly_transfer'
import type { DateTime } from 'luxon'

export default class CanteenMonthlyTransferDto extends BaseModelDto {
  declare id: string
  declare canteenId: string
  declare month: number
  declare year: number
  declare totalAmount: number
  declare status: CanteenMonthlyTransferStatus
  declare processedAt: DateTime | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(canteenMonthlyTransfer?: CanteenMonthlyTransfer) {
    super()

    if (!canteenMonthlyTransfer) return

    this.id = canteenMonthlyTransfer.id
    this.canteenId = canteenMonthlyTransfer.canteenId
    this.month = canteenMonthlyTransfer.month
    this.year = canteenMonthlyTransfer.year
    this.totalAmount = canteenMonthlyTransfer.totalAmount
    this.status = canteenMonthlyTransfer.status
    this.processedAt = canteenMonthlyTransfer.processedAt
    this.createdAt = canteenMonthlyTransfer.createdAt
    this.updatedAt = canteenMonthlyTransfer.updatedAt
  }
}
