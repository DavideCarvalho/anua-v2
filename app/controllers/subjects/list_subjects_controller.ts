import type { HttpContext } from '@adonisjs/core/http'
import Subject from '#models/subject'

export default class ListSubjectsController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const schoolId = request.input('schoolId')

    const query = Subject.query().preload('school').orderBy('name', 'asc')

    if (search) {
      query.whereILike('name', `%${search}%`)
    }

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    const subjects = await query.paginate(page, limit)

    return response.ok(subjects)
  }
}
