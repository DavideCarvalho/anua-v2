import type { HttpContext } from '@adonisjs/core/http'
import Subject from '#models/subject'

export default class ListSubjectsController {
  async handle(ctx: HttpContext) {
    const { request, response, selectedSchoolIds } = ctx
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const schoolId = request.input('schoolId')

    // Use schoolId from request (for admins) or selectedSchoolIds from middleware
    const schoolIds = schoolId ? [schoolId] : selectedSchoolIds

    const query = Subject.query().preload('school').orderBy('name', 'asc')

    if (search) {
      query.whereILike('name', `%${search}%`)
    }

    if (schoolIds && schoolIds.length > 0) {
      query.whereIn('schoolId', schoolIds)
    }

    const subjects = await query.paginate(page, limit)

    return response.ok(subjects)
  }
}
