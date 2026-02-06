import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import SchoolDto from '#models/dto/school.dto'

export default class IndexSchoolsController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const schoolChainId = request.input('schoolChainId')
    const includeUsers = request.input('includeUsers', false)

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

    // Se includeUsers, mapear os usuários para formato simplificado
    if (includeUsers) {
      const serialized = schools.serialize()
      serialized.data = serialized.data.map((school: any) => ({
        ...school,
        users: school.users?.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role?.name,
        })),
      }))
      return response.ok(serialized)
    }

    return SchoolDto.fromPaginator(schools)
  }
}
