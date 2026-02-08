import { BaseModelDto } from '@adocasts.com/dto/base'
import type Scholarship from '#models/scholarship'
import type { ScholarshipType, DiscountType } from '#models/scholarship'

export default class ScholarshipDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare schoolPartnerId: string | null
  declare name: string
  declare enrollmentDiscountPercentage: number
  declare discountPercentage: number
  declare enrollmentDiscountValue: number | null
  declare discountValue: number | null
  declare discountType: DiscountType
  declare type: ScholarshipType
  declare isActive: boolean
  declare description: string | null
  declare code: string | null

  constructor(model?: Scholarship) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolId = model.schoolId
    this.schoolPartnerId = model.schoolPartnerId
    this.name = model.name
    this.enrollmentDiscountPercentage = model.enrollmentDiscountPercentage
    this.discountPercentage = model.discountPercentage
    this.enrollmentDiscountValue = model.enrollmentDiscountValue
    this.discountValue = model.discountValue
    this.discountType = model.discountType
    this.type = model.type
    this.isActive = model.isActive
    this.description = model.description
    this.code = model.code
  }
}
