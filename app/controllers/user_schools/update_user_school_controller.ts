import type { HttpContext } from '@adonisjs/core/http'
import UserHasSchool from '#models/user_has_school'
import { updateUserSchoolValidator } from '#validators/user_school'
import AppException from '#exceptions/app_exception'
import UserHasSchoolTransformer from '#transformers/user_has_school_transformer'

export default class UpdateUserSchoolController {
  async handle({
    request,
    params,
    response,
    auth,
    effectiveUser,
    selectedSchoolIds,
    serialize,
  }: HttpContext) {
    const user = effectiveUser ?? auth.user

    if (!user) {
      throw AppException.invalidCredentials()
    }

    const payload = await request.validateUsing(updateUserSchoolValidator)

    const assignment = await UserHasSchool.query()
      .where('id', params.id)
      .where((query) => {
        query.where('userId', user.id).orWhereIn('schoolId', selectedSchoolIds ?? [])
      })
      .first()

    if (!assignment) {
      throw AppException.notFound('Relacionamento usuário-escola não encontrado')
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

    return response.ok(await serialize(UserHasSchoolTransformer.transform(assignment)))
  }
}
