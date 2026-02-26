import { BaseModelDto } from '@adocasts.com/dto/base'

export type InsuranceSchoolWithoutCoverageItem = {
  id: string
  name: string
  totalStudents: number
  totalPayments: number
  overduePayments: number
  overdueAmount: number
  defaultRate: number
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export default class InsuranceSchoolsWithoutInsuranceResponseDto extends BaseModelDto {
  declare data: InsuranceSchoolWithoutCoverageItem[]
  declare total: number

  constructor(payload?: { data: InsuranceSchoolWithoutCoverageItem[]; total: number }) {
    super()

    if (!payload) return

    this.data = payload.data
    this.total = payload.total
  }
}
