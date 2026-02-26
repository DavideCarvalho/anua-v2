import { BaseModelDto } from '@adocasts.com/dto/base'

export default class InsurancePlatformStatsResponseDto extends BaseModelDto {
  declare totalSchoolsWithInsurance: number
  declare totalInsuredStudents: number
  declare claims: {
    pending: number
    paidThisMonth: number
    paidAmountThisMonth: number
  }
  declare billings: {
    pending: number
    revenueThisMonth: number
  }
  declare overduePaymentsWithInsurance: number

  constructor(payload?: {
    totalSchoolsWithInsurance: number
    totalInsuredStudents: number
    claims: { pending: number; paidThisMonth: number; paidAmountThisMonth: number }
    billings: { pending: number; revenueThisMonth: number }
    overduePaymentsWithInsurance: number
  }) {
    super()

    if (!payload) return

    this.totalSchoolsWithInsurance = payload.totalSchoolsWithInsurance
    this.totalInsuredStudents = payload.totalInsuredStudents
    this.claims = payload.claims
    this.billings = payload.billings
    this.overduePaymentsWithInsurance = payload.overduePaymentsWithInsurance
  }
}
