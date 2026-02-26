import { BaseModelDto } from '@adocasts.com/dto/base'

export type InsuranceDefaultRateSchoolItem = {
  id: string
  name: string
  hasInsurance: boolean | null
  totalPayments: number
  overduePayments: number
  defaultRate: number
}

export default class InsuranceDefaultRateBySchoolResponseDto extends BaseModelDto {
  declare platformDefaultRate: number
  declare schools: InsuranceDefaultRateSchoolItem[]

  constructor(payload?: {
    platformDefaultRate: number
    schools: InsuranceDefaultRateSchoolItem[]
  }) {
    super()

    if (!payload) return

    this.platformDefaultRate = payload.platformDefaultRate
    this.schools = payload.schools
  }
}
