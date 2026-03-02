import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import SchoolDto from '#models/dto/school.dto'
import SchoolWithUsersDto from '#models/dto/school_with_users.dto'
import { listSchoolsValidator } from '#validators/school'

export default class IndexSchoolsController {
  async handle({ request, response }: HttpContext) {
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
      return response.ok(SchoolWithUsersDto.fromPaginator(schools))
    }

    return SchoolDto.fromPaginator(schools)
  }
}
