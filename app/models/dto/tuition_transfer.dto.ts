import { BaseModelDto } from '@adocasts.com/dto/base'
import type TuitionTransfer from '#models/tuition_transfer'
import type { TuitionTransferStatus } from '#models/tuition_transfer'
import type { DateTime } from 'luxon'

export default class TuitionTransferDto extends BaseModelDto {
  declare id: string
  declare studentPaymentId: string
  declare schoolId: string
  declare paymentAmount: number
  declare platformFeeAmount: number
  declare transferAmount: number
  declare platformFeePercentage: number
  declare status: TuitionTransferStatus
  declare pixTransactionId: string | null
  declare pixTransactionStatus: string | null
  declare failureReason: string | null
  declare retryCount: number
  declare lastRetryAt: DateTime | null
  declare processedAt: DateTime | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: TuitionTransfer) {
    super()

    if (!model) return

    this.id = model.id
    this.studentPaymentId = model.studentPaymentId
    this.schoolId = model.schoolId
    this.paymentAmount = model.paymentAmount
    this.platformFeeAmount = model.platformFeeAmount
    this.transferAmount = model.transferAmount
    this.platformFeePercentage = model.platformFeePercentage
    this.status = model.status
    this.pixTransactionId = model.pixTransactionId
    this.pixTransactionStatus = model.pixTransactionStatus
    this.failureReason = model.failureReason
    this.retryCount = model.retryCount
    this.lastRetryAt = model.lastRetryAt
    this.processedAt = model.processedAt
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
