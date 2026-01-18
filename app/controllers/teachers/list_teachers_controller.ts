import type { HttpContext } from '@adonisjs/core/http'
import Teacher from '#models/teacher'

export default class ListTeachersController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const schoolId = request.input('schoolId')

    const query = Teacher.query().preload('user').orderBy('id', 'asc')

    if (search) {
      query.whereHas('user', (builder) => {
        builder.whereILike('name', `%${search}%`)
      })
    }

    if (schoolId) {
      query.whereHas('user', (builder) => {
        builder.where('schoolId', schoolId)
      })
    }

    const teachers = await query.paginate(page, limit)

    return response.ok(teachers)
  }
}
