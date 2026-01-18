import type { HttpContext } from '@adonisjs/core/http'
import UserHasSchoolGroup from '#models/user_has_school_group'

export default class DeleteUserSchoolGroupController {
  async handle({ params, response }: HttpContext) {
    const assignment = await UserHasSchoolGroup.find(params.id)

    if (!assignment) {
      return response.notFound({ message: 'Relacionamento usuário-grupo não encontrado' })
    }

    await assignment.delete()

    return response.noContent()
  }
}
