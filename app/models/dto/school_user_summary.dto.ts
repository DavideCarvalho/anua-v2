import { BaseModelDto } from '@adocasts.com/dto/base'
import type User from '#models/user'

export default class SchoolUserSummaryDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare email: string | null
  declare role: string | null
  declare roleName: string

  constructor(user?: User) {
    super()

    if (!user) return

    this.id = user.id
    this.name = user.name
    this.email = user.email
    this.role = user.role?.name ?? null
    this.roleName = formatRoleName(user.role?.name)
  }
}

function formatRoleName(role: string | undefined): string {
  const roleMap: Record<string, string> = {
    SCHOOL_DIRECTOR: 'Diretor(a)',
    SCHOOL_COORDINATOR: 'Coordenador(a)',
    SCHOOL_ADMIN: 'Administrador',
    SCHOOL_ADMINISTRATIVE: 'Administrativo',
    SCHOOL_TEACHER: 'Professor(a)',
    SCHOOL_CANTEEN: 'Cantina',
  }

  return roleMap[role || ''] || role || 'Sem cargo'
}
