import type { HttpContext } from '@adonisjs/core/http'
import UserHasSchoolGroup from '#models/user_has_school_group'
import AppException from '#exceptions/app_exception'

export default class DeleteUserSchoolGroupController {
  async handle({ params, response, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user

    if (!user) {
      throw AppException.invalidCredentials()
    }

    const assignment = await UserHasSchoolGroup.query()
      .where('id', params.id)
      .where((query) => {
        query.where('userId', user.id)
      })
      .first()

    if (!assignment) {
      throw AppException.notFound('Relacionamento usuário-grupo não encontrado')
    }

    await assignment.delete()

    return response.noContent()
  }
}
