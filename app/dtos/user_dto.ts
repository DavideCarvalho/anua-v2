import { BaseDto } from '@adocasts.com/dto/base'
import User from '#models/user'

export class UserDto extends BaseDto {
  declare id: string
  declare name: string
  declare slug: string
  declare email: string | null
  declare phone: string | null
  declare whatsappContact: boolean
  declare birthDate: string | null
  declare documentType: string | null
  declare documentNumber: string | null
  declare imageUrl: string | null
  declare active: boolean
  declare grossSalary: number
  declare roleId: string | null
  declare schoolId: string | null
  declare schoolChainId: string | null
  declare createdAt: string
  declare updatedAt: string | null

  constructor(user: User) {
    super()
    this.id = user.id
    this.name = user.name
    this.slug = user.slug
    this.email = user.email
    this.phone = user.phone
    this.whatsappContact = user.whatsappContact
    this.birthDate = user.birthDate?.toISODate() ?? null
    this.documentType = user.documentType
    this.documentNumber = user.documentNumber
    this.imageUrl = user.imageUrl
    this.active = user.active
    this.grossSalary = user.grossSalary
    this.roleId = user.roleId
    this.schoolId = user.schoolId
    this.schoolChainId = user.schoolChainId
    this.createdAt = user.createdAt.toISO()!
    this.updatedAt = user.updatedAt?.toISO() ?? null

    // Sensitive fields are excluded (password, deletedAt, deletedBy, asaasCustomerId)
  }
}
