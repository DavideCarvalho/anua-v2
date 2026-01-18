import { BaseModelDto } from '@adocasts.com/dto/base'
import type User from '#models/user'
import RoleDto from './role.dto.js'
import SchoolDto from './school.dto.js'

export default class UserDto extends BaseModelDto {
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
  declare deletedAt: string | null
  declare deletedBy: string | null
  declare grossSalary: number
  declare roleId: string | null
  declare schoolId: string | null
  declare schoolChainId: string | null
  declare createdAt: string
  declare updatedAt: string | null
  declare role?: RoleDto
  declare school?: SchoolDto

  constructor(user?: User) {
    super()

    if (!user) return

    this.id = user.id
    this.name = user.name
    this.slug = user.slug
    this.email = user.email
    this.phone = user.phone
    this.whatsappContact = user.whatsappContact
    this.birthDate = user.birthDate ? user.birthDate.toISO() : null
    this.documentType = user.documentType
    this.documentNumber = user.documentNumber
    this.imageUrl = user.imageUrl
    this.active = user.active
    this.deletedAt = user.deletedAt ? user.deletedAt.toISO() : null
    this.deletedBy = user.deletedBy
    this.grossSalary = user.grossSalary
    this.roleId = user.roleId
    this.schoolId = user.schoolId
    this.schoolChainId = user.schoolChainId
    this.createdAt = user.createdAt.toISO()!
    this.updatedAt = user.updatedAt ? user.updatedAt.toISO() : null
    this.role = user.role ? new RoleDto(user.role) : undefined
    this.school = user.school ? new SchoolDto(user.school) : undefined
  }
}
