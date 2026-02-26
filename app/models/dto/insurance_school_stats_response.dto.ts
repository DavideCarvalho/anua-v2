import { BaseModelDto } from '@adocasts.com/dto/base'

export default class InsuranceSchoolStatsResponseDto extends BaseModelDto {
  declare insuredStudents: number
  declare totalStudents: number
  declare insuredPercentage: number
  declare activeClaims: number
  declare defaultRate: number
  declare latestBilling: {
    id: string
    period: string
    totalAmount: number
    status: string
    dueDate: string
  } | null

  constructor(payload?: {
    insuredStudents: number
    totalStudents: number
    insuredPercentage: number
    activeClaims: number
    defaultRate: number
    latestBilling: {
      id: string
      period: string
      totalAmount: number
      status: string
      dueDate: string
    } | null
  }) {
    super()

    if (!payload) return

    this.insuredStudents = payload.insuredStudents
    this.totalStudents = payload.totalStudents
    this.insuredPercentage = payload.insuredPercentage
    this.activeClaims = payload.activeClaims
    this.defaultRate = payload.defaultRate
    this.latestBilling = payload.latestBilling
  }
}
