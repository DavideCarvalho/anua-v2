import { BaseModelDto } from '@adocasts.com/dto/base'
import type School from '#models/school'
import SchoolUserSummaryDto from './school_user_summary.dto.js'

export default class SchoolWithUsersDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare logoUrl: string | null
  declare schoolChainId: string | null
  declare users?: SchoolUserSummaryDto[]

  constructor(school?: School) {
    super()

    if (!school) return

    this.id = school.id
    this.name = school.name
    this.slug = school.slug
    this.logoUrl = school.logoUrl
    this.schoolChainId = school.schoolChainId
    this.users = school.users ? SchoolUserSummaryDto.fromArray(school.users) : undefined
  }
}
