import { BaseModelDto } from '@adocasts.com/dto/base'
import type School from '#models/school'
import SchoolChainDto from './school_chain.dto.js'
import SchoolGroupDto from './school_group.dto.js'

export default class SchoolDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare street: string | null
  declare number: string | null
  declare complement: string | null
  declare neighborhood: string | null
  declare city: string | null
  declare state: string | null
  declare zipCode: string | null
  declare latitude: number | null
  declare longitude: number | null
  declare logoUrl: string | null
  declare minimumGrade: number
  declare minimumAttendancePercentage: number
  declare calculationAlgorithm: string
  declare hasInsurance: boolean | null
  declare insurancePercentage: number | null
  declare insuranceCoveragePercentage: number | null
  declare insuranceClaimWaitingDays: number | null
  declare schoolChainId: string | null
  declare createdAt: string
  declare updatedAt: string | null
  declare schoolChain?: SchoolChainDto
  declare schoolGroups?: SchoolGroupDto[]

  constructor(school?: School) {
    super()

    if (!school) return

    this.id = school.id
    this.name = school.name
    this.slug = school.slug
    this.street = school.street
    this.number = school.number
    this.complement = school.complement
    this.neighborhood = school.neighborhood
    this.city = school.city
    this.state = school.state
    this.zipCode = school.zipCode
    this.latitude = school.latitude
    this.longitude = school.longitude
    this.logoUrl = school.logoUrl
    this.minimumGrade = school.minimumGrade
    this.minimumAttendancePercentage = school.minimumAttendancePercentage
    this.calculationAlgorithm = school.calculationAlgorithm
    this.hasInsurance = school.hasInsurance
    this.insurancePercentage = school.insurancePercentage
    this.insuranceCoveragePercentage = school.insuranceCoveragePercentage
    this.insuranceClaimWaitingDays = school.insuranceClaimWaitingDays
    this.schoolChainId = school.schoolChainId
    this.createdAt = school.createdAt.toISO()!
    this.updatedAt = school.updatedAt ? school.updatedAt.toISO() : null
    this.schoolChain = school.schoolChain ? new SchoolChainDto(school.schoolChain) : undefined
    this.schoolGroups = school.schoolGroups
      ? SchoolGroupDto.fromArray(school.schoolGroups)
      : undefined
  }
}
