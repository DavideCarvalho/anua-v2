import type { HttpContext } from '@adonisjs/core/http'
import UserHasSchool from '#models/user_has_school'
import { updateUserSchoolValidator } from '#validators/user_school'

export default class UpdateUserSchoolController {
  async handle({ request, params, response }: HttpContext) {
    const payload = await request.validateUsing(updateUserSchoolValidator)

    const assignment = await UserHasSchool.find(params.id)
    if (!assignment) {
      return response.notFound({ message: 'Relacionamento usuário-escola não encontrado' })
    }

    if (payload.isDefault) {
      await UserHasSchool.query().where('userId', assignment.userId).update({ isDefault: false })
    }

    assignment.merge({
      isDefault: payload.isDefault ?? assignment.isDefault,
    })

    await assignment.save()
    await assignment.load('school')
    await assignment.load('user')

    return response.ok(assignment)
  }
}
