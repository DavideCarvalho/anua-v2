import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import School from '#models/school'

/**
 * Controller para retornar usuários disponíveis para personificação
 * Filtra por role e escola, permite busca
 * Usa UserHasSchool para relacionamento usuário-escola
 */
export default class GetImpersonationConfigController {
  async handle({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    await user.load('role')
    const roleName = user.role?.name

    // Apenas SUPER_ADMIN pode ver configurações
    if (roleName !== 'SUPER_ADMIN') {
      return response.forbidden({ message: 'Acesso negado' })
    }

    const { search, roleFilter, schoolFilter, page = 1, limit = 20 } = request.qs()

    const query = User.query()
      .whereNot('id', user.id) // Não incluir o próprio usuário
      .where('active', true)
      // Excluir ADMIN e SUPER_ADMIN da lista
      .whereHas('role', (roleQuery) => {
        roleQuery.whereNotIn('name', ['ADMIN', 'SUPER_ADMIN'])
      })
      .preload('role')
      .preload('userHasSchools', (uhsQuery) => {
        uhsQuery.preload('school')
      })

    // Filtro por busca
    if (search) {
      query.where((q) => {
        q.whereILike('name', `%${search}%`).orWhereILike('email', `%${search}%`)
      })
    }

    // Filtro por role (por ID)
    if (roleFilter && roleFilter !== 'all') {
      query.where('roleId', roleFilter)
    }

    // Filtro por escola (via UserHasSchool)
    if (schoolFilter && schoolFilter !== 'all') {
      query.whereHas('userHasSchools', (uhsQuery) => {
        uhsQuery.where('schoolId', schoolFilter)
      })
    }

    // Buscar em paralelo: usuários, roles e escolas
    const [users, allRoles, schools] = await Promise.all([
      query.orderBy('name', 'asc').paginate(page, limit),
      Role.query().orderBy('name', 'asc'),
      School.query().orderBy('name', 'asc'),
    ])

    // Filtrar ADMIN e SUPER_ADMIN dos roles disponíveis para filtro
    const availableRoles = allRoles.filter((role) => !['ADMIN', 'SUPER_ADMIN'].includes(role.name))

    return {
      users: users.all().map((u) => {
        // Pegar a primeira escola do usuário via UserHasSchool
        const firstSchool = u.userHasSchools?.[0]?.school
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role?.name,
          school: firstSchool?.name ?? null,
        }
      }),
      meta: {
        total: users.total,
        perPage: users.perPage,
        currentPage: users.currentPage,
        lastPage: users.lastPage,
      },
      availableRoles: availableRoles.map((r) => ({ id: r.id, name: r.name })),
      availableSchools: schools.map((s) => ({ id: s.id, name: s.name })),
    }
  }
}
