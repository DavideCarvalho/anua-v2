import { BaseModelDto } from '@adocasts.com/dto/base'
import type School from '#models/school'

export default class InsuranceSchoolSettingsResponseDto extends BaseModelDto {
  declare id: string
  declare hasInsurance: boolean | null
  declare insurancePercentage: number | null
  declare insuranceCoveragePercentage: number | null
  declare insuranceClaimWaitingDays: number | null

  constructor(school?: School) {
    super()

    if (!school) return

    this.id = school.id
    this.hasInsurance = school.hasInsurance
    this.insurancePercentage = school.insurancePercentage
    this.insuranceCoveragePercentage = school.insuranceCoveragePercentage
    this.insuranceClaimWaitingDays = school.insuranceClaimWaitingDays
  }
}
