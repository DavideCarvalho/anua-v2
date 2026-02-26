import { BaseModelDto } from '@adocasts.com/dto/base'
import type InsuranceClaim from '#models/insurance_claim'

export default class InsuranceClaimActionResponseDto extends BaseModelDto {
  declare id: string
  declare status: string
  declare approvedAt: string | null
  declare rejectedAt: string | null
  declare paidAt: string | null
  declare coveredAmount: number
  declare rejectionReason: string | null

  constructor(claim?: InsuranceClaim) {
    super()

    if (!claim) return

    this.id = claim.id
    this.status = claim.status
    this.approvedAt = claim.approvedAt ? claim.approvedAt.toISO() : null
    this.rejectedAt = claim.rejectedAt ? claim.rejectedAt.toISO() : null
    this.paidAt = claim.paidAt ? claim.paidAt.toISO() : null
    this.coveredAmount = claim.coveredAmount
    this.rejectionReason = claim.rejectionReason
  }
}
