import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import UserHasSchool from '#models/user_has_school'
import SchoolUserSummaryDto from '#models/dto/school_user_summary.dto'
import AppException from '#exceptions/app_exception'

export default class ListSchoolUsersController {
  async handle({ params, response }: HttpContext) {
    const schoolId = params.id

    const school = await School.find(schoolId)
    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    // Buscar todos os usuários vinculados à escola
    const userRelations = await UserHasSchool.query()
      .where('schoolId', schoolId)
      .preload('user', (userQuery) => {
        userQuery.where('active', true).preload('role')
      })

    const users = userRelations
      .filter((rel) => rel.user) // Filtrar apenas relações com usuário ativo
      .map((rel) => rel.user)
      .sort((a, b) => a.name.localeCompare(b.name))

    return response.ok(SchoolUserSummaryDto.fromArray(users))
  }
}
