import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class IndexUsersController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const schoolId = request.input('schoolId')
    const schoolChainId = request.input('schoolChainId')
    const roleId = request.input('roleId')
    const active = request.input('active')

    const query = User.query()
      .whereNull('deletedAt')
      .preload('role')
      .preload('school')
      .preload('schoolChain')
      .orderBy('name', 'asc')

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('name', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
      })
    }

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    if (schoolChainId) {
      query.where('schoolChainId', schoolChainId)
    }

    if (roleId) {
      query.where('roleId', roleId)
    }

    if (active !== undefined) {
      query.where('active', active === 'true')
    }

    const users = await query.paginate(page, limit)

    return response.ok(users)
  }
}
