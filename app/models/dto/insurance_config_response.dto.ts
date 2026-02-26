import { BaseModelDto } from '@adocasts.com/dto/base'

type ConfigSource = 'school' | 'chain' | 'default'

export default class InsuranceConfigResponseDto extends BaseModelDto {
  declare schoolId: string
  declare schoolName: string
  declare chainId: string | null
  declare chainName: string | null
  declare config: {
    hasInsurance: boolean
    insurancePercentage: number
    insuranceCoveragePercentage: number
    insuranceClaimWaitingDays: number
  }
  declare source: {
    hasInsurance: ConfigSource
    insurancePercentage: ConfigSource
    insuranceCoveragePercentage: ConfigSource
    insuranceClaimWaitingDays: ConfigSource
  }

  constructor(payload?: {
    schoolId: string
    schoolName: string
    chainId: string | null
    chainName: string | null
    config: {
      hasInsurance: boolean
      insurancePercentage: number
      insuranceCoveragePercentage: number
      insuranceClaimWaitingDays: number
    }
    source: {
      hasInsurance: ConfigSource
      insurancePercentage: ConfigSource
      insuranceCoveragePercentage: ConfigSource
      insuranceClaimWaitingDays: ConfigSource
    }
  }) {
    super()

    if (!payload) return

    this.schoolId = payload.schoolId
    this.schoolName = payload.schoolName
    this.chainId = payload.chainId
    this.chainName = payload.chainName
    this.config = payload.config
    this.source = payload.source
  }
}
