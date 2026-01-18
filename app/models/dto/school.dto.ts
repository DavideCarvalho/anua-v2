import { BaseModelDto } from '@adocasts.com/dto/base'
import type School from '#models/school'

export default class SchoolDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare logoUrl: string | null
  declare schoolChainId: string | null
  declare createdAt: string
  declare updatedAt: string | null

  constructor(school?: School) {
    super()

    if (!school) return

    this.id = school.id
    this.name = school.name
    this.slug = school.slug
    this.logoUrl = school.logoUrl
    this.schoolChainId = school.schoolChainId
    this.createdAt = school.createdAt.toISO()!
    this.updatedAt = school.updatedAt ? school.updatedAt.toISO() : null
  }
}
