import { BaseModelDto } from '@adocasts.com/dto/base'
import type SchoolPartner from '#models/school_partner'

export default class SchoolPartnerDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare name: string
  declare cnpj: string
  declare email: string | null
  declare phone: string | null
  declare contactName: string | null
  declare discountPercentage: number
  declare partnershipStartDate: Date
  declare partnershipEndDate: Date | null
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: SchoolPartner) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolId = model.schoolId
    this.name = model.name
    this.cnpj = model.cnpj
    this.email = model.email
    this.phone = model.phone
    this.contactName = model.contactName
    this.discountPercentage = model.discountPercentage
    this.partnershipStartDate = model.partnershipStartDate.toJSDate()
    this.partnershipEndDate = model.partnershipEndDate ? model.partnershipEndDate.toJSDate() : null
    this.isActive = model.isActive
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
