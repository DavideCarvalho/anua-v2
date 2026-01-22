import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import UserHasSchool from '#models/user_has_school'

export default class ListSchoolUsersController {
  async handle({ params, response }: HttpContext) {
    const schoolId = params.id

    const school = await School.find(schoolId)
    if (!school) {
      return response.notFound({ message: 'Escola não encontrada' })
    }

    // Buscar todos os usuários vinculados à escola
    const userRelations = await UserHasSchool.query()
      .where('schoolId', schoolId)
      .preload('user', (userQuery) => {
        userQuery.where('active', true).preload('role')
      })

    const users = userRelations
      .filter((rel) => rel.user) // Filtrar apenas relações com usuário ativo
      .map((rel) => ({
        id: rel.user.id,
        name: rel.user.name,
        email: rel.user.email,
        role: rel.user.role?.name,
        roleName: formatRoleName(rel.user.role?.name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return response.ok(users)
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
