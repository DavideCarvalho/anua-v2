import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import UserHasSchool from '#models/user_has_school'
import SchoolShowResponseDto from '#models/dto/school_show_response.dto'
import AppException from '#exceptions/app_exception'

export default class ShowSchoolController {
  async handle({ params, response }: HttpContext) {
    const school = await School.query()
      .where('id', params.id)
      .preload('schoolChain')
      .preload('schoolGroups')
      .preload('users', (query) => {
        query.preload('role')
      })
      .first()

    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    // Buscar o diretor da escola (usuário com role SCHOOL_DIRECTOR vinculado via UserHasSchool)
    const directorRelation = await UserHasSchool.query()
      .where('schoolId', school.id)
      .preload('user', (userQuery) => {
        userQuery.preload('role')
      })
      .whereHas('user', (userQuery) => {
        userQuery.whereHas('role', (roleQuery) => {
          roleQuery.where('name', 'SCHOOL_DIRECTOR')
        })
      })
      .first()

    return response.ok(new SchoolShowResponseDto(school, directorRelation?.user ?? null))
  }
}
