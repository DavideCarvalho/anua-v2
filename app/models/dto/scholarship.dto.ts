import { BaseModelDto } from '@adocasts.com/dto/base'
import type Scholarship from '#models/scholarship'
import type { ScholarshipType } from '#models/scholarship'
import type { DateTime } from 'luxon'

export default class ScholarshipDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare schoolPartnerId: string | null
  declare name: string
  declare enrollmentDiscountPercentage: number
  declare discountPercentage: number
  declare type: ScholarshipType
  declare isActive: boolean
  declare description: string | null
  declare code: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime | null

  constructor(model?: Scholarship) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolId = model.schoolId
    this.schoolPartnerId = model.schoolPartnerId
    this.name = model.name
    this.enrollmentDiscountPercentage = model.enrollmentDiscountPercentage
    this.discountPercentage = model.discountPercentage
    this.type = model.type
    this.isActive = model.isActive
    this.description = model.description
    this.code = model.code
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
