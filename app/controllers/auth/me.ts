import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserDto from '#models/dto/user.dto'
import School from '#models/school'
import AppException from '#exceptions/app_exception'

export default class MeController {
  async handle({ response, auth, effectiveUser, selectedSchoolIds }: HttpContext) {
    const authenticatedUser = effectiveUser ?? auth.use('web').user

    if (!authenticatedUser) {
      throw AppException.invalidCredentials()
    }

    const user = await User.query()
      .where('id', authenticatedUser.id)
      .preload('role')
      .preload('schoolChain')
      .firstOrFail()

    const firstSelectedSchoolId = selectedSchoolIds?.[0]
    if (!user.$preloaded.school && firstSelectedSchoolId) {
      const school = await School.find(firstSelectedSchoolId)
      if (school) {
        user.$setRelated('school', school)
        user.schoolId = firstSelectedSchoolId
      }
    } else if (!user.$preloaded.school && user.schoolId) {
      await user.load('school')
    }

    return response.ok(new UserDto(user))
  }
}
