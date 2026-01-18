import type { HttpContext } from '@adonisjs/core/http'
import UserHasSchool from '#models/user_has_school'

export default class DeleteUserSchoolController {
  async handle({ params, response }: HttpContext) {
    const assignment = await UserHasSchool.find(params.id)

    if (!assignment) {
      return response.notFound({ message: 'Relacionamento usuário-escola não encontrado' })
    }

    await assignment.delete()

    return response.noContent()
  }
}
