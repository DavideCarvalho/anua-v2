import { BaseModelDto } from '@adocasts.com/dto/base'
import type SchoolChain from '#models/school_chain'

export default class InsuranceChainSettingsResponseDto extends BaseModelDto {
  declare id: string
  declare hasInsuranceByDefault: boolean
  declare insurancePercentage: number | null
  declare insuranceCoveragePercentage: number | null
  declare insuranceClaimWaitingDays: number | null

  constructor(chain?: SchoolChain) {
    super()

    if (!chain) return

    this.id = chain.id
    this.hasInsuranceByDefault = chain.hasInsuranceByDefault
    this.insurancePercentage = chain.insurancePercentage
    this.insuranceCoveragePercentage = chain.insuranceCoveragePercentage
    this.insuranceClaimWaitingDays = chain.insuranceClaimWaitingDays
  }
}
