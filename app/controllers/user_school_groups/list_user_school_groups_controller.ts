import type { HttpContext } from '@adonisjs/core/http'
import UserHasSchoolGroup from '#models/user_has_school_group'
import { listUserSchoolGroupsValidator } from '#validators/user_school_group'

export default class ListUserSchoolGroupsController {
  async handle({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(listUserSchoolGroupsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const userId = payload.userId ?? auth.user?.id

    const query = UserHasSchoolGroup.query()
      .preload('schoolGroup')
      .preload('user')
      .orderBy('createdAt', 'desc')

    if (userId) {
      query.where('userId', userId)
    }

    if (payload.schoolGroupId) {
      query.where('schoolGroupId', payload.schoolGroupId)
    }

    const assignments = await query.paginate(page, limit)

    return response.ok(assignments)
  }
}
