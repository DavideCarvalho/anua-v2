import { BaseModelDto } from '@adocasts.com/dto/base'
import type School from '#models/school'
import type User from '#models/user'
import SchoolUserSummaryDto from './school_user_summary.dto.js'
import SchoolDirectorSummaryDto from './school_director_summary.dto.js'

export default class SchoolShowResponseDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare logoUrl: string | null
  declare zipCode: string | null
  declare street: string | null
  declare number: string | null
  declare complement: string | null
  declare neighborhood: string | null
  declare city: string | null
  declare state: string | null
  declare latitude: number | null
  declare longitude: number | null
  declare minimumGrade: number
  declare minimumAttendancePercentage: number
  declare calculationAlgorithm: string
  declare hasInsurance: boolean | null
  declare insurancePercentage: number | null
  declare insuranceCoveragePercentage: number | null
  declare insuranceClaimWaitingDays: number | null
  declare schoolChain: { id: string; name: string } | null
  declare users: SchoolUserSummaryDto[]
  declare director: SchoolDirectorSummaryDto | null
  declare createdAt: string
  declare updatedAt: string | null

  constructor(school?: School, director?: User | null) {
    super()

    if (!school) return

    this.id = school.id
    this.name = school.name
    this.slug = school.slug
    this.logoUrl = school.logoUrl
    this.zipCode = school.zipCode
    this.street = school.street
    this.number = school.number
    this.complement = school.complement
    this.neighborhood = school.neighborhood
    this.city = school.city
    this.state = school.state
    this.latitude = school.latitude
    this.longitude = school.longitude
    this.minimumGrade = school.minimumGrade
    this.minimumAttendancePercentage = school.minimumAttendancePercentage
    this.calculationAlgorithm = school.calculationAlgorithm
    this.hasInsurance = school.hasInsurance
    this.insurancePercentage = school.insurancePercentage
    this.insuranceCoveragePercentage = school.insuranceCoveragePercentage
    this.insuranceClaimWaitingDays = school.insuranceClaimWaitingDays
    this.schoolChain = school.schoolChain
      ? { id: school.schoolChain.id, name: school.schoolChain.name }
      : null
    this.users = school.users ? SchoolUserSummaryDto.fromArray(school.users) : []
    this.director = director ? new SchoolDirectorSummaryDto(director) : null
    this.createdAt = school.createdAt.toISO()!
    this.updatedAt = school.updatedAt?.toISO() ?? null
  }
}
