import type { HttpContext } from '@adonisjs/core/http'
import UserHasSchool from '#models/user_has_school'
import AppException from '#exceptions/app_exception'

export default class DeleteUserSchoolController {
  async handle({ params, response, auth, effectiveUser, selectedSchoolIds }: HttpContext) {
    const user = effectiveUser ?? auth.user

    if (!user) {
      throw AppException.invalidCredentials()
    }

    const assignment = await UserHasSchool.query()
      .where('id', params.id)
      .where((query) => {
        query.where('userId', user.id).orWhereIn('schoolId', selectedSchoolIds ?? [])
      })
      .first()

    if (!assignment) {
      throw AppException.notFound('Relacionamento usuário-escola não encontrado')
    }

    await assignment.delete()

    return response.noContent()
  }
}
