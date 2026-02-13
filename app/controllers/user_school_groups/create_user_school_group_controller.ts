import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import SchoolGroup from '#models/school_group'
import UserHasSchoolGroup from '#models/user_has_school_group'
import { createUserSchoolGroupValidator } from '#validators/user_school_group'
import AppException from '#exceptions/app_exception'

export default class CreateUserSchoolGroupController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserSchoolGroupValidator)

    const user = await User.find(payload.userId)
    if (!user) {
      throw AppException.notFound('Usuário não encontrado')
    }

    const schoolGroup = await SchoolGroup.find(payload.schoolGroupId)
    if (!schoolGroup) {
      throw AppException.notFound('Grupo escolar não encontrado')
    }

    const existing = await UserHasSchoolGroup.query()
      .where('userId', payload.userId)
      .where('schoolGroupId', payload.schoolGroupId)
      .first()

    if (existing) {
      throw AppException.operationFailedWithProvidedData(409)
    }

    const assignment = await UserHasSchoolGroup.create({
      userId: payload.userId,
      schoolGroupId: payload.schoolGroupId,
    })

    await assignment.load('schoolGroup')
    await assignment.load('user')

    return response.created(assignment)
  }
}
