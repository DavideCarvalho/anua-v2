import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import { listSchoolsValidator } from '#validators/school'
import SchoolTransformer from '#transformers/school_transformer'

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

export default class IndexSchoolsController {
  async handle({ request, response, serialize }: HttpContext) {
    const filters = await request.validateUsing(listSchoolsValidator)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const search = filters.search ?? ''
    const schoolChainId = filters.schoolChainId
    const includeUsers = filters.includeUsers ?? false

    const query = School.query().preload('schoolChain').orderBy('name', 'asc')

    // Carregar usuários com roles de escola (para admin impersonation)
    if (includeUsers) {
      query.preload('users', (usersQuery) => {
        usersQuery
          .preload('role')
          .whereHas('role', (roleQuery) => {
            roleQuery.whereIn('name', [
              'SCHOOL_DIRECTOR',
              'SCHOOL_COORDINATOR',
              'SCHOOL_ADMIN',
              'SCHOOL_ADMINISTRATIVE',
              'SCHOOL_TEACHER',
              'SCHOOL_CANTEEN',
            ])
          })
          .orderBy('name', 'asc')
          .limit(10) // Limitar para não sobrecarregar
      })
    }

    if (search) {
      query.where((builder) => {
        builder.whereILike('name', `%${search}%`).orWhereILike('slug', `%${search}%`)
      })
    }

    if (schoolChainId) {
      query.where('schoolChainId', schoolChainId)
    }

    const schools = await query.paginate(page, limit)

    // Se includeUsers, retornar DTO específico com usuários resumidos
    if (includeUsers) {
      const data = schools.all().map((school) => ({
        id: school.id,
        name: school.name,
        slug: school.slug,
        logoUrl: school.logoUrl,
        schoolChainId: school.schoolChainId,
        users:
          school.users?.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role?.name ?? null,
            roleName: formatRoleName(user.role?.name),
          })) ?? [],
      }))

      return response.ok({ data, metadata: schools.getMeta() })
    }

    return serialize(SchoolTransformer.paginate(schools.all(), schools.getMeta()))
  }
}
