import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import School from '#models/school'
import UserHasSchool from '#models/user_has_school'
import { createUserSchoolValidator } from '#validators/user_school'

export default class CreateUserSchoolController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserSchoolValidator)

    const user = await User.find(payload.userId)
    if (!user) {
      return response.notFound({ message: 'Usuário não encontrado' })
    }

    const school = await School.find(payload.schoolId)
    if (!school) {
      return response.notFound({ message: 'Escola não encontrada' })
    }

    const existing = await UserHasSchool.query()
      .where('userId', payload.userId)
      .where('schoolId', payload.schoolId)
      .first()

    if (existing) {
      return response.conflict({ message: 'Usuário já possui acesso a esta escola' })
    }

    if (payload.isDefault) {
      await UserHasSchool.query().where('userId', payload.userId).update({ isDefault: false })
    }

    const assignment = await UserHasSchool.create({
      userId: payload.userId,
      schoolId: payload.schoolId,
      isDefault: payload.isDefault ?? false,
    })

    await assignment.load('school')
    await assignment.load('user')

    return response.created(assignment)
  }
}
