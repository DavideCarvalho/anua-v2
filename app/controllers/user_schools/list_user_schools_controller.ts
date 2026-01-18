import type { HttpContext } from '@adonisjs/core/http'
import UserHasSchool from '#models/user_has_school'
import { listUserSchoolsValidator } from '#validators/user_school'

export default class ListUserSchoolsController {
  async handle({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(listUserSchoolsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const userId = payload.userId ?? auth.user?.id

    const query = UserHasSchool.query()
      .preload('school')
      .preload('user')
      .orderBy('createdAt', 'desc')

    if (userId) {
      query.where('userId', userId)
    }

    if (payload.schoolId) {
      query.where('schoolId', payload.schoolId)
    }

    const assignments = await query.paginate(page, limit)

    return response.ok(assignments)
  }
}
