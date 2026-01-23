import { BaseModelDto } from '@adocasts.com/dto/base'
import type InsuranceClaim from '#models/insurance_claim'
import type { InsuranceClaimStatus } from '#models/insurance_claim'
import type { DateTime } from 'luxon'

export default class InsuranceClaimDto extends BaseModelDto {
  declare id: string
  declare studentPaymentId: string
  declare claimDate: DateTime
  declare overdueAmount: number
  declare coveragePercentage: number
  declare coveredAmount: number
  declare status: InsuranceClaimStatus
  declare approvedAt: DateTime | null
  declare approvedBy: string | null
  declare paidAt: DateTime | null
  declare rejectedAt: DateTime | null
  declare rejectedBy: string | null
  declare rejectionReason: string | null
  declare notes: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime | null

  constructor(insuranceClaim?: InsuranceClaim) {
    super()

    if (!insuranceClaim) return

    this.id = insuranceClaim.id
    this.studentPaymentId = insuranceClaim.studentPaymentId
    this.claimDate = insuranceClaim.claimDate
    this.overdueAmount = insuranceClaim.overdueAmount
    this.coveragePercentage = insuranceClaim.coveragePercentage
    this.coveredAmount = insuranceClaim.coveredAmount
    this.status = insuranceClaim.status
    this.approvedAt = insuranceClaim.approvedAt
    this.approvedBy = insuranceClaim.approvedBy
    this.paidAt = insuranceClaim.paidAt
    this.rejectedAt = insuranceClaim.rejectedAt
    this.rejectedBy = insuranceClaim.rejectedBy
    this.rejectionReason = insuranceClaim.rejectionReason
    this.notes = insuranceClaim.notes
    this.createdAt = insuranceClaim.createdAt
    this.updatedAt = insuranceClaim.updatedAt
  }
}
