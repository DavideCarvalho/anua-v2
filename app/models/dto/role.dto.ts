import { BaseModelDto } from '@adocasts.com/dto/base'
import type Role from '#models/role'

export default class RoleDto extends BaseModelDto {
  declare id: string
  declare name: string

  constructor(role?: Role) {
    super()

    if (!role) return

    this.id = role.id
    this.name = role.name
  }
}
