import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'

export default class IndexSchoolsController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const schoolChainId = request.input('schoolChainId')

    const query = School.query().preload('schoolChain').orderBy('name', 'asc')

    if (search) {
      query.where((builder) => {
        builder.whereILike('name', `%${search}%`).orWhereILike('slug', `%${search}%`)
      })
    }

    if (schoolChainId) {
      query.where('schoolChainId', schoolChainId)
    }

    const schools = await query.paginate(page, limit)

    return response.ok(schools)
  }
}
