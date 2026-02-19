import { BaseModelDto } from '@adocasts.com/dto/base'
import type InsuranceClaim from '#models/insurance_claim'
import type { InsuranceClaimStatus } from '#models/insurance_claim'

export default class InsuranceClaimDto extends BaseModelDto {
  declare id: string
  declare studentPaymentId: string
  declare claimDate: Date
  declare overdueAmount: number
  declare coveragePercentage: number
  declare coveredAmount: number
  declare status: InsuranceClaimStatus
  declare approvedAt: Date | null
  declare approvedBy: string | null
  declare paidAt: Date | null
  declare rejectedAt: Date | null
  declare rejectedBy: string | null
  declare rejectionReason: string | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date | null

  constructor(insuranceClaim?: InsuranceClaim) {
    super()

    if (!insuranceClaim) return

    this.id = insuranceClaim.id
    this.studentPaymentId = insuranceClaim.studentPaymentId
    this.claimDate = insuranceClaim.claimDate.toJSDate()
    this.overdueAmount = insuranceClaim.overdueAmount
    this.coveragePercentage = insuranceClaim.coveragePercentage
    this.coveredAmount = insuranceClaim.coveredAmount
    this.status = insuranceClaim.status
    this.approvedAt = insuranceClaim.approvedAt ? insuranceClaim.approvedAt.toJSDate() : null
    this.approvedBy = insuranceClaim.approvedBy
    this.paidAt = insuranceClaim.paidAt ? insuranceClaim.paidAt.toJSDate() : null
    this.rejectedAt = insuranceClaim.rejectedAt ? insuranceClaim.rejectedAt.toJSDate() : null
    this.rejectedBy = insuranceClaim.rejectedBy
    this.rejectionReason = insuranceClaim.rejectionReason
    this.notes = insuranceClaim.notes
    this.createdAt = insuranceClaim.createdAt.toJSDate()
    this.updatedAt = insuranceClaim.updatedAt ? insuranceClaim.updatedAt.toJSDate() : null
  }
}
